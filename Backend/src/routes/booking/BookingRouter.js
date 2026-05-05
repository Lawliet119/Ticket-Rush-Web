'use strict'

const express = require('express')
const BookingController = require('../../controllers/Booking.controller')
const router = express.Router()
const { authentication } = require('../../utils/authUtils')
const asyncHandler = require('../../middleware/errorHandler')

// Authentication required for booking and viewing tickets
router.use(authentication)

router.post('/hold', asyncHandler(BookingController.holdSeats))
router.post('/cancel-hold', asyncHandler(BookingController.cancelHold))
router.post('/checkout', asyncHandler(BookingController.checkout))
router.get('/my-tickets', asyncHandler(BookingController.getMyTickets))

module.exports = router
