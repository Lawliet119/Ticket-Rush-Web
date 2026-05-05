'use strict';

const redis = require('../config/redis');
const { getIO } = require('../config/socket');
const crypto = require('crypto');

// Throttling configuration
const MAX_ACTIVE_USERS = 50; // ⚠️ Đang set = 0 ĐỂ TEST GIAO DIỆN PHÒNG CHỜ (Mặc định là 50)
const BATCH_SIZE = 20;

class QueueService {

    // User requests to enter the booking area
    static joinQueue = async (eventId, userId, socketId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;

        // Map userId to socketId for targeting
        await redis.hset(socketMapKey, userId, socketId);

        const activeCount = await redis.scard(activeKey);

        if (activeCount < MAX_ACTIVE_USERS) {
            // Room available, enter directly
            await redis.sadd(activeKey, userId);
            
            // Generate temporary booking token (JWT or simple random hex)
            const token = crypto.randomBytes(16).toString('hex');
            await redis.setex(`booking_token:${eventId}:${userId}`, 300, token); // Valid for 5 mins

            return { status: 'GRANTED', token };
        } else {
            // Room full, add to waiting queue
            await redis.zadd(queueKey, Date.now(), userId);
            
            const position = await redis.zrank(queueKey, userId);
            return { status: 'WAITING', position: position + 1 };
        }
    }

    // Process the queue (called by cron every 2 seconds)
    static processQueue = async (eventId) => {
        const activeKey = `active:${eventId}`;
        const queueKey = `queue:${eventId}`;
        const socketMapKey = `socketmap:${eventId}`;

        const activeCount = await redis.scard(activeKey);
        const availableSlots = MAX_ACTIVE_USERS - activeCount;

        if (availableSlots > 0) {
            // Pop the oldest users from the queue
            const nextUsers = await redis.zpopmin(queueKey, Math.min(availableSlots, BATCH_SIZE));
            
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
        remainingUsers.forEach(async (userId, index) => {
            const socketId = await redis.hget(socketMapKey, userId);
            if (socketId) {
                getIO().to(socketId).emit('queue_position', { position: index + 1 });
            }
        });
    }

    // Called when user leaves seat map, finishes checkout, or token expires
    static removeFromActive = async (eventId, userId) => {
        await redis.srem(`active:${eventId}`, userId);
        await redis.zrem(`queue:${eventId}`, userId);
        await redis.hdel(`socketmap:${eventId}`, userId);
        await redis.del(`booking_token:${eventId}:${userId}`);
    }
}

module.exports = QueueService;
