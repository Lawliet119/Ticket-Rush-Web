'use strict'
const rateLimit = require('express-rate-limit')

// Global limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        status: 'error',
        code: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
})

// Auth limiter: 10 requests per 15 minutes per IP (Stricter for brute force/spam)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: 'error',
        code: 429,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Booking limiter: 20 requests per 15 minutes per IP (To prevent bot booking)
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        status: 'error',
        code: 429,
        message: 'Too many booking attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = {
    globalLimiter,
    authLimiter,
    bookingLimiter
}
