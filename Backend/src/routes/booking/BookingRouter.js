'use strict'

const express = require('express')
const BookingController = require('../../controllers/Booking.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication } = require('../../middleware/auth.middleware')
const { bookingLimiter } = require('../../middleware/rateLimiter')

// All booking routes require authentication
router.use(asyncHandler(authentication))

// Route for holding seats (selection phase)
router.post('/hold', bookingLimiter, asyncHandler(BookingController.holdSeats))

// Route for completing payment
router.post('/checkout', bookingLimiter, asyncHandler(BookingController.checkout))

// Route for manual cancellation of held seats
router.post('/cancel-hold', asyncHandler(BookingController.cancelHold))

// Route for retrieving user's tickets
router.get('/my-tickets', asyncHandler(BookingController.getMyTickets))

module.exports = router
