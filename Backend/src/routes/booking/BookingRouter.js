'use strict'

const express = require('express')
const BookingController = require('../../controllers/Booking.controller')
const router = express.Router()
const { authentication } = require('../../utils/authUtils')
const asyncHandler = require('../../middleware/asyncHandler')

// Authentication required for booking and viewing tickets
router.use(asyncHandler(authentication))

const { bookingLimiter } = require('../../middleware/rateLimiter')

router.post('/hold', bookingLimiter, asyncHandler(BookingController.holdSeats))
router.post('/cancel-hold', bookingLimiter, asyncHandler(BookingController.cancelHold))
router.post('/checkout', bookingLimiter, asyncHandler(BookingController.checkout))
router.get('/my-tickets', asyncHandler(BookingController.getMyTickets))

module.exports = router
