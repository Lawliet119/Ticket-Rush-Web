import http from '../lib/http'

export const createEventApi = async (payload) => {
  // Check if payload is FormData
  const isFormData = payload instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  
  const res = await http.post('/event/create', payload, config) 
  return res.data
}

export const getAllEventsApi = async (params = {}) => {
  const res = await http.get('/event', { params })
  return res.data
}

export const getEventDetailApi = async (eventId) => {
  const res = await http.get(`/event/${eventId}`) 
  return res.data
}

export const updateEventApi = async (eventId, payload) => {
  const isFormData = payload instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  
  const res = await http.put(`/event/update/${eventId}`, payload, config)
  return res.data
}

export const deleteEventApi = async (eventId) => {
  const res = await http.delete(`/event/delete/${eventId}`)
  return res.data
}