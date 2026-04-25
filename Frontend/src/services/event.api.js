import http from '../lib/http'

export const createEventApi = async (payload) => {
  const res = await http.post('/events', payload) 
}

export const getAllEventsApi = async () => {
  const res = await http.get('/events')
  return res.data
}

export const getEventDetailApi = async (eventId) => {
  const res = await http.get(`/events/${eventId}`)
  return res.data
}