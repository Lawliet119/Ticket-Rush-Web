'use strict'

const express = require('express')
const QueueController = require('../../controllers/Queue.controller')
const router = express.Router()
const asyncHandler = require('../../middleware/asyncHandler')

router.get('/position', asyncHandler(QueueController.getUserPosition))

module.exports = router
