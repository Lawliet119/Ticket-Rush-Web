'use strict'

const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter: Protects the entire API from general flooding.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        status: 'error',
        code: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

/**
 * Auth Limiter: Stricter limit for authentication routes (Login/Signup/Forgot Password).
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 'error',
        code: 429,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Booking Limiter: Prevents bot spamming on sensitive booking routes.
 */
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        status: 'error',
        code: 429,
        message: 'Booking operations are too frequent, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    bookingLimiter
};
