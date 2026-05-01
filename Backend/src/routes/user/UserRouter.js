'use strict'
const express = require('express')
const UserController = require('../../controllers/User.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/errorHandler')
const { authentication } = require('../../utils/authUtils')
const upload = require('../../middleware/uploadHandler')

router.use(asyncHandler(authentication))
router.get('/profile', asyncHandler(UserController.getProfile))
router.put('/profile', upload.single('avatar'), asyncHandler(UserController.updateProfile))

module.exports = router
