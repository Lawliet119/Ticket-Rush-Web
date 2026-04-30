'use strict'

const express = require('express')
const EventController = require('../../controllers/Event.controller')
const router = express.Router()
const { authentication, checkRole } = require('../../utils/authUtils')
const asyncHandler = require('../../middleware/errorHandler')
const upload = require('../../middleware/uploadHandler')

// Public routes
router.get('', asyncHandler(EventController.getAllEvents))
router.get('/:id', asyncHandler(EventController.getEventDetail))

// Authentication required
router.use(authentication)

// Admin routes
router.post('/create', checkRole(['ADMIN']), upload.single('banner'), asyncHandler(EventController.createEvent))
router.put('/update/:id', checkRole(['ADMIN']), upload.single('banner'), asyncHandler(EventController.updateEvent))
router.delete('/delete/:id', checkRole(['ADMIN']), asyncHandler(EventController.deleteEvent))

module.exports = router
