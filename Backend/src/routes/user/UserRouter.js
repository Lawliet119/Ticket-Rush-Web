'use strict'

const express = require('express')
const UserController = require('../../controllers/User.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')
const { authentication } = require('../../middleware/auth.middleware')

router.use(asyncHandler(authentication))

router.get('/', asyncHandler(UserController.getAllUsers))
router.get('/:id', asyncHandler(UserController.getUserById))
router.put('/:id', asyncHandler(UserController.updateUser))
router.delete('/:id', asyncHandler(UserController.deleteUser))

module.exports = router
