'use strict'

const EventService = require('../services/event.service')
const { OK, CREATED } = require('../core/success.response')

class EventController {
    
    createEvent = async (req, res, next) => {
        const payload = req.body;
        
        // Handle uploaded file if present
        if (req.file) {
            // Cloudinary trả về link public trực tiếp trong thuộc tính path
            payload.banner_url = req.file.path;
        }
        
        // Parse zones back from string if they come as stringified JSON via FormData
        if (typeof payload.zones === 'string') {
            try {
                payload.zones = JSON.parse(payload.zones);
            } catch (e) {
                // Ignore parse errors, let validation handle bad data
                console.error("Failed to parse zones", e);
            }
        }

        new CREATED({
            message: 'Event created successfully!',
            metadata: await EventService.createEvent(payload, req.userId)
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
