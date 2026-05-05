'use strict'

const express = require('express')
const AccessController = require('../../controllers/Access.controller') 
const router = express.Router()
const asyncHandler = require('../../middleware/errorHandler')

const { authentication } = require('../../utils/authUtils')
const { authLimiter } = require('../../middleware/rateLimiter')

router.post('/signup', authLimiter, asyncHandler(AccessController.signUp))
router.post('/login', authLimiter, asyncHandler(AccessController.logIn))
router.post('/forgot-password', authLimiter, asyncHandler(AccessController.forgotPassword))
router.post('/reset-password/:token', authLimiter, asyncHandler(AccessController.resetPassword))
router.post('/refresh-token', asyncHandler(AccessController.handleRefreshToken))

// Authentication required
router.use(asyncHandler(authentication))

router.get('/me', asyncHandler(AccessController.getMe))
router.post('/logout', asyncHandler(AccessController.logout))

module.exports = router