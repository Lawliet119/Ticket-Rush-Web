'use strict'

const EventService = require('../services/event.service')
const { OK, CREATED } = require('../core/success.response')

class EventController {
    
    createEvent = async (req, res, next) => {
        new CREATED({
            message: 'Event created successfully!',
            metadata: await EventService.createEvent(req.body, req.userId)
        }).send(res)
    }

    getAllEvents = async (req, res, next) => {
        new OK({
            message: 'Get events list success!',
            metadata: await EventService.getAllEvents(req.query)
        }).send(res)
    }

    getEventDetail = async (req, res, next) => {
        new OK({
            message: 'Get event detail success!',
            metadata: await EventService.getEventDetail(req.params.id)
        }).send(res)
    }
}

module.exports = new EventController()
