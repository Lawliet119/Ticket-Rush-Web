'use strict'

const BookingService = require('../services/booking.service')
const { OK } = require('../core/success.response')

class BookingController {

    /**
     * Handle seat holding request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    holdSeats = async (req, res, next) => {
        const userId = req.userId;
        const { eventId, seatIds } = req.body;

        const result = await BookingService.holdSeats({ userId, eventId, seatIds });

        new OK({
            message: 'Seats held successfully.',
            metadata: result
        }).send(res);
    }

    /**
     * Handle checkout and payment request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    checkout = async (req, res, next) => {
        const userId = req.userId; 
        const { eventId, seatIds } = req.body;

        const result = await BookingService.checkout({ userId, eventId, seatIds });

        new OK({
            message: 'Payment successful. Tickets have been created.',
            metadata: result
        }).send(res);
    }

    /**
     * Handle request to get user's tickets
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    getMyTickets = async (req, res, next) => {
        const userId = req.userId;

        const tickets = await BookingService.getMyTickets(userId);

        new OK({
            message: 'Tickets retrieved successfully.',
            metadata: tickets
        }).send(res);
    }

    /**
     * Handle manual cancellation of seat holds
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    cancelHold = async (req, res, next) => {
        const userId = req.userId;
        const { seatIds } = req.body;

        const result = await BookingService.cancelHold({ userId, seatIds });

        new OK({
            message: 'Seat holds released successfully.',
            metadata: result
        }).send(res);
    }
}

module.exports = new BookingController()
