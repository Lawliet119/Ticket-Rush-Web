import http from '../lib/http'

export const signupApi = async (payload) => {
  const res = await http.post('/signup', payload)
  return res.data
}

export const loginApi = async (payload) => {
  const res = await http.post('/login', payload)
  return res.data
}

export const forgotPasswordApi = async (payload) => {
  const res = await http.post('/forgot-password', payload)
  return res.data
}

// need token from email link to reset password
export const resetPasswordApi = async (token, payload) => {
  const res = await http.post(`/reset-password/${token}`, payload)
  return res.data
}

// Sneeds Authentication
export const getMeApi = async () => {
  const res = await http.get('/me')
  return res.data
}

export const logoutApi = async () => {
  const res = await http.post('/logout')
  return res.data
}
