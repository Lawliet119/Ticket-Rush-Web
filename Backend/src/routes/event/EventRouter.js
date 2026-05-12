'use strict'

const express = require('express')
const EventController = require('../../controllers/Event.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication, checkRole } = require('../../middleware/auth.middleware')
const upload = require('../../middleware/uploadHandler')

// Public routes
router.get('/', asyncHandler(EventController.getAllEvents))
router.get('/:id', asyncHandler(EventController.getEventDetail))

// Protected routes (Admin only)
router.use(asyncHandler(authentication))
router.use(checkRole(['ADMIN']))

router.post('/create', upload.single('image'), asyncHandler(EventController.createEvent))
router.put('/update/:id', upload.single('image'), asyncHandler(EventController.updateEvent))
router.delete('/delete/:id', asyncHandler(EventController.deleteEvent))

module.exports = router
