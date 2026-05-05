'use strict'
const cron = require('node-cron');
const prisma = require('../config/prisma');

class CronService {
    static init(io) {
        // Run every 30 seconds to clean up expired seat locks
        cron.schedule('*/30 * * * * *', async () => {
            try {
                const now = new Date();
                
                // Find expired locks
                const expiredLocks = await prisma.seat_locks.findMany({
                    where: { expires_at: { lt: now } }
                });

                if (expiredLocks.length > 0) {
                    const expiredSeatIds = expiredLocks.map(l => l.seat_id);

                    await prisma.$transaction(async (tx) => {
                        await tx.seat_locks.deleteMany({
                            where: { id: { in: expiredLocks.map(l => l.id) } }
                        });

                        await tx.seats.updateMany({
                            where: { id: { in: expiredSeatIds }, status: 'LOCKED' },
                            data: { status: 'AVAILABLE' }
                        });
                    });

                    expiredSeatIds.forEach(seatId => {
                        io.emit('seat_updated', seatId, false);
                    });

                    console.log(`[Cron] Released ${expiredLocks.length} expired seats.`);
                }
            } catch (error) {
                console.error('[Cron] Error scanning expired seats:', error);
            }
        });

        // Run every 2 seconds to process the Virtual Queue
        setInterval(async () => {
            try {
                // Ideally, we fetch active event IDs from DB. 
                // For demonstration, we assume we process a specific event or we track active events in Redis.
                const QueueService = require('./queue.service');
                const redis = require('../config/redis');
                
                // Get all active events that have a queue
                const keys = await redis.keys('queue:*');
                const eventIds = keys.map(k => k.split(':')[1]);
                
                for (let eventId of eventIds) {
                    await QueueService.processQueue(eventId);
                }
            } catch (error) {
                console.error('[QueueProcessor] Error:', error);
            }
        }, 2000);
    }
}

module.exports = CronService;
