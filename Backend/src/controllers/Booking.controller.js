'use strict'

const BookingService = require('../services/booking.service')
const { OK } = require('../core/success.response')

class BookingController {

    holdSeats = async (req, res, next) => {
        const userId = req.userId;
        const { eventId, seatIds } = req.body;

        const result = await BookingService.holdSeats({ userId, eventId, seatIds });

        new OK({
            message: 'Seats held successfully.',
            metadata: result
        }).send(res);
    }

    checkout = async (req, res, next) => {
        const userId = req.userId; 
        const { eventId, seatIds } = req.body;

        const result = await BookingService.checkout({ userId, eventId, seatIds });

        new OK({
            message: 'Payment successful. Tickets have been created.',
            metadata: result
        }).send(res);
    }

    getMyTickets = async (req, res, next) => {
        const userId = req.userId;

        const tickets = await BookingService.getMyTickets(userId);

        new OK({
            message: 'Tickets retrieved successfully.',
            metadata: tickets
        }).send(res);
    }
}

module.exports = new BookingController()
