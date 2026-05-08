'use strict';

const redis = require('../config/redis');
const { getIO } = require('../config/socket');
const crypto = require('crypto');

// Throttling configuration
const MAX_ACTIVE_USERS = parseInt(process.env.MAX_ACTIVE_USERS || '50');
const BATCH_SIZE = 20;

class QueueService {

    // User requests to enter the booking area
    /**
     * Handle a user's request to enter the booking area (Virtual Queue)
     * @param {string} eventId - ID of the event
     * @param {string} userId - ID of the user
     * @param {string} socketId - Current socket ID of the user
     * @returns {Promise<Object>} Object containing status ('GRANTED'|'WAITING') and token/position
     */
    static joinQueue = async (eventId, userId, socketId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;

        // Always update socketId mapping (handles reconnects)
        await redis.hset(socketMapKey, userId, socketId);

        // Check if user is already in the active set (e.g. page refresh, reconnect)
        const isAlreadyActive = await redis.sismember(activeKey, userId);
        if (isAlreadyActive) {
            // User is already active — re-send GRANTED with existing or new token
            let token = await redis.get(`booking_token:${eventId}:${userId}`);
            if (!token) {
                token = crypto.randomBytes(16).toString('hex');
                await redis.setex(`booking_token:${eventId}:${userId}`, 300, token);
            }
            return { status: 'GRANTED', token };
        }

        // Check if user is already in the waiting queue
        const existingRank = await redis.zrank(queueKey, userId);
        if (existingRank !== null) {
            // User is already waiting — just return current position (don't re-add with new timestamp)
            return { status: 'WAITING', position: existingRank + 1 };
        }

        // New user — check if room is available
        const activeCount = await redis.scard(activeKey);

        if (activeCount < MAX_ACTIVE_USERS) {
            // Room available, enter directly
            await redis.sadd(activeKey, userId);

            // Generate temporary booking token
            const token = crypto.randomBytes(16).toString('hex');
            await redis.setex(`booking_token:${eventId}:${userId}`, 300, token);

            return { status: 'GRANTED', token };
        } else {
            // Room full, add to waiting queue
            await redis.zadd(queueKey, Date.now(), userId);

            const position = await redis.zrank(queueKey, userId);
            return { status: 'WAITING', position: position + 1 };
        }
    }

    // Process the queue (called by cron every 2 seconds)
    /**
     * Process the waiting queue and promote users to the active set
     * @param {string} eventId - ID of the event
     */
    static processQueue = async (eventId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;

        const activeCount = await redis.scard(activeKey);
        const availableSlots = MAX_ACTIVE_USERS - activeCount;

        if (availableSlots > 0) {
            // Pop the oldest users from the queue
            const nextUsers = await redis.zpopmin(queueKey, Math.min(availableSlots, BATCH_SIZE));

            // ioredis zpopmin returns flat array: [member1, score1, member2, score2, ...]
            for (let i = 0; i < nextUsers.length; i += 2) {
                const userId = nextUsers[i];
                // Move to active
                await redis.sadd(activeKey, userId);

                // Generate token
                const token = crypto.randomBytes(16).toString('hex');
                await redis.setex(`booking_token:${eventId}:${userId}`, 300, token);

                // Notify user via socket
                const socketId = await redis.hget(socketMapKey, userId);
                if (socketId) {
                    getIO().to(socketId).emit('queue_passed', { token });
                }
            }
        }

        // Broadcast updated positions to remaining users
        const remainingUsers = await redis.zrange(queueKey, 0, -1);
        for (let index = 0; index < remainingUsers.length; index++) {
            const userId = remainingUsers[index];
            const socketId = await redis.hget(socketMapKey, userId);
            if (socketId) {
                getIO().to(socketId).emit('queue_position', { position: index + 1 });
            }
        }
    }

    // Called when user leaves seat map, finishes checkout, or token expires
    /**
     * Remove a user from the active set or queue
     * @param {string} eventId - ID of the event
     * @param {string} userId - ID of the user
     */
    static removeFromActive = async (eventId, userId) => {
        await redis.srem(`active:${eventId}`, userId);
        await redis.zrem(`queue:${eventId}`, userId);
        await redis.hdel(`socketmap:${eventId}`, userId);
        await redis.del(`booking_token:${eventId}:${userId}`);

        // Immediately trigger queue processing so waiting users don't have to wait for next cron tick
        try {
            await QueueService.processQueue(eventId);
        } catch (err) {
            console.error('[QueueService] Error processing queue after removal:', err);
        }
    }
}

module.exports = QueueService;
