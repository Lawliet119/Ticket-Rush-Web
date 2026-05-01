'use strict'

const express = require('express')
const router = express.Router()
router.use('/v1/api/event',require('./event/EventRouter'))
router.use('/v1/api/booking', require('./booking/BookingRouter'))
router.use('/v1/api',require('./access/AccessRouter'))
router.use('/v1/api/dashboard', require('./dashboard/DashboardRouter'));
router.use('/v1/api/users', require('./user/UserRouter'));


module.exports = router