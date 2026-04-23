'use strict'

const express = require('express')
const router = express.Router()
router.use('/v1/api',require('./access/AccessRouter'))
router.use('/v1/api/event',require('./event/EventRouter'))



module.exports = router