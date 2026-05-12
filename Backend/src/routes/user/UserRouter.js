'use strict'

const express = require('express')
const UserController = require('../../controllers/User.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication } = require('../../middleware/auth.middleware')
const upload = require('../../middleware/uploadHandler')

// All user routes require authentication
router.use(asyncHandler(authentication))

// Profile routes (for the logged-in user)
router.get('/profile', asyncHandler(UserController.getProfile))
router.put('/profile', upload.single('avatar'), asyncHandler(UserController.updateProfile))

module.exports = router
