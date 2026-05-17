import http from '../lib/http'

/**
 * Process payment and complete booking
 * @param {Object} payload - { eventId, seatIds }
 * @returns {Promise<Object>} API response
 */
export const checkoutApi = async (payload) => {
  // payload: { eventId, seatIds }
  const token = localStorage.getItem(`booking_token_${payload.eventId}`);
  const res = await http.post('/booking/checkout', payload, {
    headers: { 'x-booking-token': token }
  })
  return res.data
}

/**
 * Temporarily hold seats for a user
 * @param {Object} payload - { eventId, seatIds }
 * @returns {Promise<Object>} API response including expiry time
 */
export const holdSeatsApi = async (payload) => {
  // payload: { eventId, seatIds }
  const token = localStorage.getItem(`booking_token_${payload.eventId}`);
  const res = await http.post('/booking/hold', payload, {
    headers: { 'x-booking-token': token }
  })
  return res.data
}

/**
 * Manually cancel seat holds
 * @param {Object} payload - { seatIds }
 * @returns {Promise<Object>} API response
 */
export const cancelHoldApi = async (payload) => {
  // payload: { seatIds }
  const res = await http.post('/booking/cancel-hold', payload)
  return res.data
}

/**
 * Retrieve all tickets for the current user
 * @returns {Promise<Object>} API response containing tickets array
 */
export const getMyTicketsApi = async () => {
  const res = await http.get('/booking/my-tickets')
  return res.data
}
