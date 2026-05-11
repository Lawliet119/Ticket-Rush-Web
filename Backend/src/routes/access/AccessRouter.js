'use strict'

const express = require('express')
const AccessController = require('../../controllers/Access.controller') 
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication } = require('../../middleware/auth.middleware') // Import from new location
const { authLimiter } = require('../../middleware/rateLimiter')

// Public routes
router.post('/signup', authLimiter, asyncHandler(AccessController.signUp))
router.post('/login', authLimiter, asyncHandler(AccessController.logIn))
router.post('/forgot-password', authLimiter, asyncHandler(AccessController.forgotPassword))
router.post('/reset-password/:token', authLimiter, asyncHandler(AccessController.resetPassword))
router.get('/verify-email/:token', asyncHandler(AccessController.verifyEmail))
router.post('/resend-verification', authLimiter, asyncHandler(AccessController.resendVerification))

router.post('/refresh-token', asyncHandler(AccessController.handleRefreshToken))

// Authentication middleware applied below this line
router.use(asyncHandler(authentication))

// Private routes
router.get('/me', asyncHandler(AccessController.getMe))
router.post('/logout', asyncHandler(AccessController.logout))

module.exports = router