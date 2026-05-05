'use strict'

const express = require('express')
const AccessController = require('../../controllers/Access.controller') 
const router = express.Router()
const asyncHandler = require('../../middleware/errorHandler')

const { authentication } = require('../../utils/authUtils')

router.post('/signup', asyncHandler(AccessController.signUp))
router.post('/login', asyncHandler(AccessController.logIn))
router.post('/forgot-password', asyncHandler(AccessController.forgotPassword))
router.post('/reset-password/:token', asyncHandler(AccessController.resetPassword))
router.post('/refresh-token', asyncHandler(AccessController.handleRefreshToken))

// Authentication required
router.use(asyncHandler(authentication))

router.get('/me', asyncHandler(AccessController.getMe))
router.post('/logout', asyncHandler(AccessController.logout))

module.exports = router