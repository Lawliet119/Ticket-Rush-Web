'use strict'

const express = require('express')
const router = express.Router()
router.use('/v1/api/event',require('./event/EventRouter'))
router.use('/v1/api',require('./access/AccessRouter'))



module.exports = router