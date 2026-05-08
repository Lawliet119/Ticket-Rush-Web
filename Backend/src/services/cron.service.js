'use strict'
const cron = require('node-cron');
const BookingRepository = require('../repositories/booking.repo');

class CronService {
    /**
     * Initialize background jobs (Cron and Interval tasks)
     * @param {Object} io - Socket.io instance for broadcasting events
     */
    static init(io) {
        // Run every 30 seconds to clean up expired seat locks
        cron.schedule('*/30 * * * * *', async () => {
            try {
                const releasedSeatIds = await BookingRepository.cleanupExpiredSeatLocks();

                if (releasedSeatIds.length > 0) {
                    releasedSeatIds.forEach(seatId => {
                        io.emit('seat_updated', seatId, false);
                    });

                    console.log(`[Cron] Released ${releasedSeatIds.length} expired seats.`);
                }
            } catch (error) {
                console.error('[Cron] Error scanning expired seats:', error);
            }
        });

        // Run every 2 seconds to process the Virtual Queue
        setInterval(async () => {
            try {
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
