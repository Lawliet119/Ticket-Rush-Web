'use strict'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validate that a value is a valid UUID v4 string
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid UUID, false otherwise
 */
const isValidUUID = (value) => {
    return typeof value === 'string' && UUID_REGEX.test(value)
}

/**
 * Validate that all elements in an array are valid UUIDs
 * @param {Array} arr - Array of UUIDs to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {string} Error message if invalid, empty string if valid
 */
const validateUUIDArray = (arr, fieldName = 'IDs') => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return `${fieldName} must be a non-empty array`
    }

    for (let i = 0; i < arr.length; i++) {
        if (!isValidUUID(arr[i])) {
            return `${fieldName}[${i}] is not a valid UUID`
        }
    }

    return ''
}

/**
 * Validate password strength
 * Requirements: at least 8 characters, contains uppercase, lowercase, and a digit
 * @param {string} password - Password string to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return 'Password is required'
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters long'
    }

    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter'
    }

    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter'
    }

    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one digit'
    }

    return ''
}

/**
 * Validate email format
 * @param {string} email - Email string to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return 'Email is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return 'Invalid email format'
    }

    return ''
}

module.exports = {
    isValidUUID,
    validateUUIDArray,
    validatePassword,
    validateEmail
}
