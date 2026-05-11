'use strict'

const QueueService = require('../services/queue.service')
const { SuccessResponse } = require('../core/success.response')
const asyncHandler = require('../middleware/asyncHandler')

class QueueController {
    static getUserPosition = asyncHandler(async (req, res) => {
        const { eventId, userId } = req.query
        const position = await QueueService.getUserPosition(eventId, userId)
        
        new SuccessResponse({
            message: 'Get queue position success',
            metadata: { position }
        }).send(res)
    })
}

module.exports = QueueController
