'use strict'

// PHẢI CÓ DÒNG NÀY để thư viện hoạt động
const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter: Nới lỏng lên 1000 requests/15p để demo mượt mà.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: {
        status: 'error',
        code: 429,
        message: 'Hệ thống nhận thấy quá nhiều yêu cầu từ IP của bạn.'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

/**
 * Auth Limiter: Cho phép thử 100 lần (thay vì 10) để thoải mái test login.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 'error',
        code: 429,
        message: 'Thử đăng nhập quá nhiều lần. Vui lòng đợi một lát.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Booking Limiter: Cho phép 200 thao tác đặt vé / 15 phút.
 */
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        status: 'error',
        code: 429,
        message: 'Thao tác đặt vé quá nhanh.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    bookingLimiter
};
