'use strict'

const EventRepository = require('../repositories/event.repo')
const { BadRequestError } = require('../core/error.response')

class EventService {
    
    static createEvent = async (payload, userId) => {
        const { event_date, sale_start_at, sale_end_at } = payload

        // Basic Validation
        if (new Date(sale_start_at) >= new Date(event_date)) {
            throw new BadRequestError('Sale start date must be before event date')
        }

        if (new Date(sale_start_at) >= new Date(sale_end_at)) {
            throw new BadRequestError('Sale start date must be before sale end date')
        }

        return await EventRepository.createEvent({
            ...payload,
            created_by: userId
        })
    }

    static getAllEvents = async ({ limit = 10, page = 1, status }) => {
        const offset = (page - 1) * limit
        return await EventRepository.findAllEvents({ limit: parseInt(limit), offset: parseInt(offset), status })
    }

    static getEventDetail = async (eventId) => {
        const event = await EventRepository.findEventById(eventId)
        if (!event) throw new BadRequestError('Event not found')
        return event
    }
}

module.exports = EventService
