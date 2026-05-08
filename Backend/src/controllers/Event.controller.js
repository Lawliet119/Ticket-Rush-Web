'use strict'

const EventService = require('../services/event.service')
const { OK, CREATED } = require('../core/success.response')

class EventController {
    
    /**
     * Handle event creation request (with optional file upload)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    createEvent = async (req, res, next) => {
        const payload = req.body;
        
        if (req.file) {
            payload.banner_url = req.file.path;
        }
        
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

    /**
     * Handle request to list all events with filters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    getAllEvents = async (req, res, next) => {
        new OK({
            message: 'Get events list success!',
            metadata: await EventService.getAllEvents(req.query)
        }).send(res)
    }

    /**
     * Handle request for a single event's detailed information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    getEventDetail = async (req, res, next) => {
        new OK({
            message: 'Get event detail success!',
            metadata: await EventService.getEventDetail(req.params.id)
        }).send(res)
    }

    /**
     * Handle event update request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    updateEvent = async (req, res, next) => {
        const payload = req.body;
        
        // Handle uploaded file if present
        if (req.file) {
            payload.banner_url = req.file.path;
        }

        new OK({
            message: 'Event updated successfully!',
            metadata: await EventService.updateEvent(req.params.id, payload)
        }).send(res)
    }

    /**
     * Handle event deletion request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    deleteEvent = async (req, res, next) => {
        await EventService.deleteEvent(req.params.id)
        new OK({
            message: 'Event deleted successfully!',
            metadata: {}
        }).send(res)
    }
}

module.exports = new EventController()
