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

    static updateEvent = async (eventId, payload) => {
        // Basic check if event exists
        const existingEvent = await EventRepository.findEventById(eventId)
        if (!existingEvent) throw new BadRequestError('Event not found')

        // Additional validation if needed
        if (payload.event_date && payload.sale_start_at) {
            if (new Date(payload.sale_start_at) >= new Date(payload.event_date)) {
                throw new BadRequestError('Sale start date must be before event date')
            }
        }

      
        const updateData = { ...payload }
        delete updateData.zones

        return await EventRepository.updateEvent(eventId, updateData)
    }

    static deleteEvent = async (eventId) => {
        const existingEvent = await EventRepository.findEventById(eventId)
        if (!existingEvent) throw new BadRequestError('Event not found')
        
        try {
            await EventRepository.deleteEvent(eventId)
            return true
        } catch (error) {
            throw new BadRequestError('Cannot delete event. It may have existing orders.')
        }
    }
}

module.exports = EventService
