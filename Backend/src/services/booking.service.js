'use strict'

const BookingRepository = require('../repositories/booking.repo')
const { BadRequestError } = require('../core/error.response')
const { getIO } = require('../config/socket')

class BookingService {
    
    static holdSeats = async ({ userId, eventId, seatIds }) => {
        if (!seatIds || seatIds.length === 0) {
            throw new BadRequestError('Please select at least 1 seat to hold');
        }

        try {
            // Hold seats for 10 minutes (600 seconds)
            const result = await BookingRepository.holdSeats(userId, eventId, seatIds, 600);
            
            // Broadcast signal to all other clients that seats are locked
            seatIds.forEach(id => {
                getIO().emit('seat_updated', id, true);
            });

            return result;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
    
    static checkout = async ({ userId, eventId, seatIds }) => {
        if (!seatIds || seatIds.length === 0) {
            throw new BadRequestError('Please select at least 1 seat to checkout');
        }

        try {
            // Call Repository to perform Checkout Transaction
            const result = await BookingRepository.checkout(userId, eventId, seatIds);
            
            // Broadcast signal that seats have been successfully sold
            seatIds.forEach(id => {
                getIO().emit('seat_sold_realtime', id);
            });

            getIO().emit('dashboard_stats_updated');

            return result;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    static getMyTickets = async (userId) => {
        return await BookingRepository.getMyTickets(userId);
    }

    static cancelHold = async ({ userId, seatIds }) => {
        if (!seatIds || seatIds.length === 0) return { count: 0 };

        try {
            const result = await BookingRepository.cancelHold(userId, seatIds);

            // Broadcast to all clients that these seats are now available again
            if (result.count > 0) {
                seatIds.forEach(id => {
                    getIO().emit('seat_updated', id, false); // false = unlocked
                });
            }

            return result;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
}


module.exports = BookingService
