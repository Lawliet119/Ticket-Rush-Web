'use strict'

const express = require('express')
const AccessController = require('../../controllers/Access.controller') 
const router = express.Router()
const asyncHandler = require('../../middleware/errorHandler')

router.post('/signup',asyncHandler(AccessController.signUp))

module.exports = router