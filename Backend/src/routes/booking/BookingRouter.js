'use strict'

const express = require('express')
const BookingController = require('../../controllers/Booking.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication } = require('../../middleware/auth.middleware')
const { bookingLimiter } = require('../../middleware/rateLimiter')

router.use(asyncHandler(authentication))

router.post('/', bookingLimiter, asyncHandler(BookingController.createBooking))
router.get('/my-bookings', asyncHandler(BookingController.getMyBookings))
router.get('/:id', asyncHandler(BookingController.getBookingById))
router.post('/:id/cancel', asyncHandler(BookingController.cancelBooking))

module.exports = router
