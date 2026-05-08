import http from '../lib/http'

/**
 * Create a new event (supports FormData for images)
 * @param {Object|FormData} payload - Event data
 * @returns {Promise<Object>} API response
 */
export const createEventApi = async (payload) => {
  // Check if payload is FormData
  const isFormData = payload instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  
  const res = await http.post('/event/create', payload, config) 
  return res.data
}

/**
 * Fetch all events with optional filters
 * @param {Object} params - { limit, page, status }
 * @returns {Promise<Object>} API response with events list
 */
export const getAllEventsApi = async (params = {}) => {
  const res = await http.get('/event', { params })
  return res.data
}

/**
 * Get details of a specific event including zones and seats
 * @param {string} eventId - UUID of the event
 * @returns {Promise<Object>} API response with event details
 */
export const getEventDetailApi = async (eventId) => {
  const res = await http.get(`/event/${eventId}`) 
  return res.data
}

/**
 * Update an existing event
 * @param {string} eventId - UUID of the event
 * @param {Object|FormData} payload - Update data
 * @returns {Promise<Object>} API response
 */
export const updateEventApi = async (eventId, payload) => {
  const isFormData = payload instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  
  const res = await http.put(`/event/update/${eventId}`, payload, config)
  return res.data
}

/**
 * Delete an event
 * @param {string} eventId - UUID of the event
 * @returns {Promise<Object>} API response
 */
export const deleteEventApi = async (eventId) => {
  const res = await http.delete(`/event/delete/${eventId}`)
  return res.data
}

/**
 * Fetch analytics data for the admin dashboard
 * @returns {Promise<Object>} API response with dashboard stats
 */
export const getDashboardStatsApi = async () => {
  const res = await http.get('/dashboard/stats');
  return res.data;
}