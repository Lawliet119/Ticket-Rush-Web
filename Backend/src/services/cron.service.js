'use strict';

const cron = require('node-cron');
const BookingRepository = require('../repositories/booking.repo');
const QueueService = require('./queue.service');
const redis = require('../config/redis');

/**
 * Service to manage scheduled background tasks.
 */
class CronService {
    
    /**
     * Initialize background jobs
     * @param {Object} io - Socket.io instance for real-time broadcasts
     */
    static init(io) {
        
        // Task 1: Cleanup expired seat locks every 30 seconds
        cron.schedule('*/30 * * * * *', async () => {
            try {
                const releasedSeatIds = await BookingRepository.cleanupExpiredSeatLocks();
                if (releasedSeatIds.length > 0) {
                    releasedSeatIds.forEach(seatId => {
                        io.emit('seat_updated', seatId, false);
                    });
                    console.log(`[Cron] Successfully released ${releasedSeatIds.length} expired seat(s).`);
                }
            } catch (error) {
                console.error('[Cron] Error releasing seats:', error);
            }
        });

        // Task 2: Process Virtual Queue batches every 2 seconds
        setInterval(async () => {
            try {
                let cursor = '0';
                const queueKeys = new Set();

                // Non-blocking scan to find all active queues
                do {
                    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'queue:*', 'COUNT', 100);
                    cursor = nextCursor;
                    keys.forEach(k => queueKeys.add(k));
                } while (cursor !== '0');
                
                const eventIds = Array.from(queueKeys).map(k => k.split(':')[1]);
                
                for (let eventId of eventIds) {
                    await QueueService.processQueue(eventId);
                }
            } catch (error) {
                console.error('[QueueProcessor] Error processing queue:', error);
            }
        }, 2000);

        console.log('[CronService] Background tasks are active.');
    }
}

module.exports = CronService;