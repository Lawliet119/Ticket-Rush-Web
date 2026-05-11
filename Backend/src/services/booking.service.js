'use strict'

const BookingRepository = require('../repositories/booking.repo')
const { BadRequestError } = require('../core/error.response')
const { validateUUIDArray, isValidUUID } = require('../utils/validator')
const { getIO } = require('../config/socket')

class BookingService {
    
    /**
     * Temporarily hold seats for a user
     * @param {Object} params - Holding parameters
     * @param {string} params.userId - ID of the user holding seats
     * @param {string} params.eventId - ID of the event
     * @param {Array<string>} params.seatIds - List of seat IDs to hold
     * @returns {Promise<Object>} Holding result
     */
    static holdSeats = async ({ userId, eventId, seatIds }) => {
        if (!isValidUUID(eventId)) {
            throw new BadRequestError('Invalid event ID format');
        }
        const seatValidation = validateUUIDArray(seatIds, 'seatIds');
        if (seatValidation) {
            throw new BadRequestError(seatValidation);
        }

        try {
            // Hold seats for 10 minutes (600 seconds)
            const result = await BookingRepository.holdSeats(userId, eventId, seatIds,10);
            
            // Broadcast signal to all other clients that seats are locked
            seatIds.forEach(id => {
                getIO().emit('seat_updated', id, true);
            });

            return result;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
    
    /**
     * Complete the checkout process for held seats
     * @param {Object} params - Checkout parameters
     * @param {string} params.userId - ID of the user checking out
     * @param {string} params.eventId - ID of the event
     * @param {Array<string>} params.seatIds - List of seat IDs to buy
     * @returns {Promise<Object>} Checkout result
     */
    static checkout = async ({ userId, eventId, seatIds }) => {
        if (!isValidUUID(eventId)) {
            throw new BadRequestError('Invalid event ID format');
        }
        const seatValidation = validateUUIDArray(seatIds, 'seatIds');
        if (seatValidation) {
            throw new BadRequestError(seatValidation);
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

    /**
     * Retrieve all tickets belonging to a specific user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} List of tickets
     */
    static getMyTickets = async (userId) => {
        return await BookingRepository.getMyTickets(userId);
    }

    /**
     * Cancel held seats and make them available again
     * @param {Object} params - Cancellation parameters
     * @param {string} params.userId - User ID
     * @param {Array<string>} params.seatIds - List of seat IDs to release
     * @returns {Promise<Object>} Cancellation result
     */
    static cancelHold = async ({ userId, seatIds }) => {
        if (!seatIds || seatIds.length === 0) return { count: 0 };
        const seatValidation = validateUUIDArray(seatIds, 'seatIds');
        if (seatValidation) {
            throw new BadRequestError(seatValidation);
        }

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
