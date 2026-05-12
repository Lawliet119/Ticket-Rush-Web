'use strict'

const express = require('express')
const DashboardController = require('../../controllers/Dashboard.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication, checkRole } = require('../../middleware/auth.middleware')

router.use(asyncHandler(authentication))
router.use(checkRole(['ADMIN']))

router.get('/stats', asyncHandler(DashboardController.getDashboardStats))
// router.get('/recent-bookings', asyncHandler(DashboardController.getRecentBookings))

module.exports = router