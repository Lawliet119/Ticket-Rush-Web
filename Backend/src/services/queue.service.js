'use strict';

const redis = require('../config/redis');
const { getIO } = require('../config/socket');
const crypto = require('crypto');

/**
 * Batch processing configuration
 * Increase this number to allow more users to pass the queue at once
 */
const BATCH_SIZE = 50; 

/**
 * Virtual Queue Service
 * Uses Redis Lua Scripts for atomic operations and race condition prevention.
 */
class QueueService {
    static _shortUser(userId = '') {
        return userId.length > 5 ? userId.slice(-5) : userId;
    }

    static async logQueueState(eventId, reason = 'snapshot') {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;

        const [activeUsers, queueUsersWithScores] = await Promise.all([
            redis.smembers(activeKey),
            redis.zrange(queueKey, 0, -1, 'WITHSCORES')
        ]);

        const queueUsers = [];
        for (let i = 0; i < queueUsersWithScores.length; i += 2) {
            queueUsers.push({
                userId: queueUsersWithScores[i],
                score: Number(queueUsersWithScores[i + 1])
            });
        }

        console.log(`[Queue][State] event=${eventId} reason=${reason} activeCount=${activeUsers.length} queueCount=${queueUsers.length}`);
        console.log('[Queue][State] activeUsers=', activeUsers);
        console.log('[Queue][State] queueUsers=', queueUsers);
    }
    
    /**
     * Get the max active users limit from environment variables
     * @returns {number}
     */
    static getMaxActiveUsers() {
        const val = process.env.MAX_ACTIVE_USERS;
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }

    /**
     * Initialize the queue system.
     * Cleans up stale Redis keys to ensure a fresh session.
     */
    static async init() {
        const patterns = ['active:*', 'queue:*', 'booking_token:*', 'socketmap:*'];
        for (const pattern of patterns) {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) await redis.del(keys);
        }
        
        console.log('==============================================');
        console.log('[Virtual Queue] Service initialized successfully.');
        console.log(`[Virtual Queue] Active Limit: ${QueueService.getMaxActiveUsers()} users.`);
        console.log('==============================================');
    }

    /**
     * LUA: Atomic Join Queue logic
     */
    static get _JOIN_LUA() {
        return `
            local activeKey = KEYS[1]
            local queueKey = KEYS[2]
            local userId = ARGV[1]
            local maxUsers = tonumber(ARGV[2])
            local timestamp = tonumber(ARGV[3])

            if redis.call('SISMEMBER', activeKey, userId) == 1 then
                return {1, 0}
            end

            local activeCount = redis.call('SCARD', activeKey)
            if activeCount < maxUsers then
                redis.call('SADD', activeKey, userId)
                return {1, 0}
            else
                redis.call('ZADD', queueKey, timestamp, userId)
                return {2, redis.call('ZRANK', queueKey, userId)}
            end
        `;
    }

    /**
     * LUA: Atomic Batch Processing logic
     */
    static get _PROCESS_LUA() {
        return `
            local activeKey = KEYS[1]
            local queueKey = KEYS[2]
            local maxUsers = tonumber(ARGV[1])
            local batchSize = tonumber(ARGV[2])

            local activeCount = redis.call('SCARD', activeKey)
            local availableSlots = maxUsers - activeCount

            if availableSlots <= 0 then return {} end

            local numToPop = math.min(availableSlots, batchSize)
            local nextUsers = redis.call('ZPOPMIN', queueKey, numToPop)

            if #nextUsers > 0 then
                for i = 1, #nextUsers, 2 do
                    redis.call('SADD', activeKey, nextUsers[i])
                end
            end
            return nextUsers
        `;
    }

    /**
     * Handle user joining the queue
     * @param {string} eventId 
     * @param {string} userId 
     * @param {string} socketId 
     */
    static joinQueue = async (eventId, userId, socketId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;
        const maxUsers = QueueService.getMaxActiveUsers();

        await redis.hset(socketMapKey, userId, socketId);
        const result = await redis.eval(QueueService._JOIN_LUA, 2, activeKey, queueKey, userId, maxUsers, Date.now());
        
        const status = result[0] === 1 ? 'GRANTED' : 'WAITING';
        
        if (status === 'GRANTED') {
            console.log(`[Queue] User ${userId.slice(-5)}: GRANTED`);
            const token = await QueueService.generateToken(eventId, userId);
            await QueueService.logQueueState(eventId, `join_queue_granted:${QueueService._shortUser(userId)}`);
            return { status: 'GRANTED', token };
        } else {
            console.log(`[Queue] User ${userId.slice(-5)}: WAITING (Pos: ${result[1] + 1})`);
            await QueueService.logQueueState(eventId, `join_queue_waiting:${QueueService._shortUser(userId)}`);
            return { status: 'WAITING', position: result[1] + 1 };
        }
    }

    /**
     * Generate a short-lived access token (5 mins)
     */
    static generateToken = async (eventId, userId) => {
        let token = await redis.get(`booking_token:${eventId}:${userId}`);
        if (!token) {
            token = crypto.randomBytes(16).toString('hex');
            await redis.setex(`booking_token:${eventId}:${userId}`, 300, token);
            console.log(`[Queue][Token] generated new token for event=${eventId} user=${QueueService._shortUser(userId)} ttl=300s`);
        } else {
            const ttl = await redis.ttl(`booking_token:${eventId}:${userId}`);
            console.log(`[Queue][Token] reused existing token for event=${eventId} user=${QueueService._shortUser(userId)} ttl=${ttl}s`);
        }
        return token;
    }

    /**
     * Verify if a provided booking token is valid
     */
    static verifyToken = async (eventId, userId, providedToken) => {
        if (!providedToken) {
            console.log(`[Queue][Token] verify failed: missing token event=${eventId} user=${QueueService._shortUser(userId)}`);
            return false;
        }
        const validToken = await redis.get(`booking_token:${eventId}:${userId}`);
        const isValid = validToken === providedToken;
        if (!isValid) {
            const ttl = await redis.ttl(`booking_token:${eventId}:${userId}`);
            console.log(`[Queue][Token] verify failed: invalid/expired token event=${eventId} user=${QueueService._shortUser(userId)} ttl=${ttl}s`);
        }
        return isValid;
    }

    /**
     * Batch process the queue to promote waiting users
     */
    static processQueue = async (eventId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;
        const maxUsers = QueueService.getMaxActiveUsers();

        const nextUsers = await redis.eval(QueueService._PROCESS_LUA, 2, activeKey, queueKey, maxUsers, BATCH_SIZE);

        if (nextUsers && nextUsers.length > 0) {
            console.log(`[Queue] Batch Promotion: Granted access to ${nextUsers.length / 2} users.`);
            for (let i = 0; i < nextUsers.length; i += 2) {
                const userId = nextUsers[i];
                const token = await QueueService.generateToken(eventId, userId);
                const socketId = await redis.hget(socketMapKey, userId);
                if (socketId) {
                    getIO().to(socketId).emit('queue_passed', { token });
                }
            }
            await QueueService.logQueueState(eventId, 'process_queue_batch_promoted');
        }
        getIO().emit('queue_moved', { eventId });
    }

    /**
     * Update user socket ID mapping
     */
    static updateSocketId = async (eventId, userId, socketId) => {
        await redis.hset(`socketmap:${eventId}`, userId, socketId);
    }

    /**
     * Cleanup users whose tokens have expired
     */
    static cleanupExpiredTokens = async (eventId) => {
        const activeKey = `active:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;
        
        // Get all active users
        const activeUsers = await redis.smembers(activeKey);
        
        let removedCount = 0;
        for (const userId of activeUsers) {
            const tokenExists = await redis.exists(`booking_token:${eventId}:${userId}`);
            if (!tokenExists) {
                // Notify user they were kicked out
                const socketId = await redis.hget(socketMapKey, userId);
                if (socketId) {
                    getIO().to(socketId).emit('token_expired', { message: 'Your session has expired.' });
                }

                // Token expired, remove user
                await QueueService.removeFromActive(eventId, userId, 'token_expired_cleanup');
                
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            console.log(`[Queue] Removed ${removedCount} users due to token expiration.`);
            await QueueService.logQueueState(eventId, 'cleanup_expired_tokens_done');
        }
    }

    /**
     * Remove user from active set when they leave the seat map
     */
    static removeFromActive = async (eventId, userId, reason = 'unknown') => {
        const removed = await redis.srem(`active:${eventId}`, userId);
        await redis.zrem(`queue:${eventId}`, userId);
        await redis.del(`booking_token:${eventId}:${userId}`);
        
        if (removed) {
            console.log(`[Queue][Leave] event=${eventId} user=${QueueService._shortUser(userId)} reason=${reason} removed=true`);
            getIO().emit('queue_moved', { eventId });
            await QueueService.logQueueState(eventId, `leave_queue:${reason}`);
        } else {
            console.log(`[Queue][Leave] event=${eventId} user=${QueueService._shortUser(userId)} reason=${reason} removed=false (user not in active)`);
        }
    }

    /**
     * Check current status of a user in the queue system
     */
    static checkStatus = async (eventId, userId) => {
        const isMember = await redis.sismember(`active:${eventId}`, userId);
        if (isMember) {
            console.log(`[Queue][Status] event=${eventId} user=${QueueService._shortUser(userId)} status=GRANTED -> generateToken path`);
            return { status: 'GRANTED', token: await QueueService.generateToken(eventId, userId) };
        }
        const rank = await redis.zrank(`queue:${eventId}`, userId);
        return rank !== null ? { status: 'WAITING', position: rank + 1 } : { status: 'NONE' };
    }
}

module.exports = QueueService;