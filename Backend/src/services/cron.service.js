'use strict'
const cron = require('node-cron');
const prisma = require('../config/prisma');

class CronService {
    static init(io) {
        // Run every 5 seconds for quick testing (could be every 1 minute in production)
        cron.schedule('*/5 * * * * *', async () => {
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
    }
}

module.exports = CronService;
