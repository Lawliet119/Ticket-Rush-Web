'use strict'

const BookingRepository = require('../repositories/booking.repo')
const { BadRequestError } = require('../core/error.response')

class BookingService {
    
    static holdSeats = async ({ userId, eventId, seatIds }) => {
        if (!seatIds || seatIds.length === 0) {
            throw new BadRequestError('Please select at least 1 seat to hold');
        }

        try {
            // Hold seats for 30 seconds for quick testing
            const result = await BookingRepository.holdSeats(userId, eventId, seatIds, 30);
            
            // Broadcast signal to all other clients that seats are locked
            if (global._io) {
                seatIds.forEach(id => {
                    global._io.emit('seat_updated', id, true);
                });
            }

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
            if (global._io) {
                seatIds.forEach(id => {
                    global._io.emit('seat_sold_realtime', id);
                });

                
                  global._io.emit('dashboard_stats_updated');
        
            }

            return result;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    static getMyTickets = async (userId) => {
        return await BookingRepository.getMyTickets(userId);
    }
}


module.exports = BookingService
