'use strict'

const express = require('express')
const BookingController = require('../../controllers/Booking.controller')
const router = express.Router()
const { authentication } = require('../../utils/authUtils')
const asyncHandler = require('../../middleware/errorHandler')

// Phải đăng nhập mới được đặt ghế và xem vé
router.use(authentication)

router.post('/hold', asyncHandler(BookingController.holdSeats))
router.post('/checkout', asyncHandler(BookingController.checkout))
router.get('/my-tickets', asyncHandler(BookingController.getMyTickets))

module.exports = router
