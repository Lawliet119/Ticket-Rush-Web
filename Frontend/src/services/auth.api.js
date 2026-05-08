import http from '../lib/http'

/**
 * Register a new user
 * @param {Object} payload - { name, email, password }
 * @returns {Promise<Object>} API response
 */
export const signupApi = async (payload) => {
  const res = await http.post('/signup', payload)
  return res.data
}

/**
 * Authenticate user
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} API response including tokens
 */
export const loginApi = async (payload) => {
  const res = await http.post('/login', payload)
  return res.data
}

/**
 * Request password reset email
 * @param {Object} payload - { email }
 * @returns {Promise<Object>} API response
 */
export const forgotPasswordApi = async (payload) => {
  const res = await http.post('/forgot-password', payload)
  return res.data
}

// need token from email link to reset password
/**
 * Reset password using token from email
 * @param {string} token - Reset token from URL
 * @param {Object} payload - { password }
 * @returns {Promise<Object>} API response
 */
export const resetPasswordApi = async (token, payload) => {
  const res = await http.post(`/reset-password/${token}`, payload)
  return res.data
}

// Sneeds Authentication
/**
 * Get current authenticated user profile
 * @returns {Promise<Object>} User profile data
 */
export const getMeApi = async () => {
  const res = await http.get('/me')
  return res.data
}

/**
 * Logout user and clear tokens
 * @returns {Promise<Object>} API response
 */
export const logoutApi = async () => {
  const res = await http.post('/logout')
  return res.data
}
