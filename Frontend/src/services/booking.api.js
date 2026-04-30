import http from '../lib/http'

export const checkoutApi = async (payload) => {
  // payload: { eventId, seatIds }
  const res = await http.post('/booking/checkout', payload)
  return res.data
}

export const holdSeatsApi = async (payload) => {
  // payload: { eventId, seatIds }
  const res = await http.post('/booking/hold', payload)
  return res.data
}

export const getMyTicketsApi = async () => {
  const res = await http.get('/booking/my-tickets')
  return res.data
}
