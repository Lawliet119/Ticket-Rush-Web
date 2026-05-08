'use strict'

const EventRepository = require('../repositories/event.repo')
const { BadRequestError } = require('../core/error.response')

class EventService {
    
    /**
     * Create a new event with its zones and seats
     * @param {Object} payload - Event data
     * @param {string} userId - ID of the user creating the event
     * @returns {Promise<Object>} Created event object
     */
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

    /**
     * Retrieve a paginated list of events
     * @param {Object} params - Query parameters
     * @param {number} params.limit - Number of items per page
     * @param {number} params.page - Current page number
     * @param {string} params.status - Filter by event status
     * @returns {Promise<Object>} Object containing events list and total count
     */
    static getAllEvents = async ({ limit = 10, page = 1, status }) => {
        const offset = (page - 1) * limit
        return await EventRepository.findAllEvents({ limit: parseInt(limit), offset: parseInt(offset), status })
    }

    /**
     * Get detailed information about a specific event
     * @param {string} eventId - ID of the event
     * @returns {Promise<Object>} Event detail object
     */
    static getEventDetail = async (eventId) => {
        const event = await EventRepository.findEventById(eventId)
        if (!event) throw new BadRequestError('Event not found')
        return event
    }

    /**
     * Update an existing event's information
     * @param {string} eventId - ID of the event to update
     * @param {Object} payload - New event data
     * @returns {Promise<Object>} Updated event object
     */
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

    /**
     * Delete an event from the database
     * @param {string} eventId - ID of the event to delete
     * @returns {Promise<boolean>} True if deletion was successful
     */
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
