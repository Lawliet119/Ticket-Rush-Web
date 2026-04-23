'use strict'

const express = require('express')
const EventController = require('../../controllers/Event.controller')
const router = express.Router()
const { authentication, checkRole } = require('../../utils/authUtils')
const asyncHandler = require('../../middleware/errorHandler')

// Public routes
router.get('', asyncHandler(EventController.getAllEvents))
router.get('/:id', asyncHandler(EventController.getEventDetail))

// Authentication required
router.use(authentication)

// Admin routes
router.post('/create', checkRole(['ADMIN']), asyncHandler(EventController.createEvent))

module.exports = router
