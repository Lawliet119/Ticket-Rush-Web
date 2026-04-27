import http from '../lib/http'

export const createEventApi = async (payload) => {
  const res = await http.post('/event/create', payload) 
  return res.data
}

export const getAllEventsApi = async () => {
  const res = await http.get('/event') 
  return res.data
}

export const getEventDetailApi = async (eventId) => {
  const res = await http.get(`/event/${eventId}`) 
  return res.data
}