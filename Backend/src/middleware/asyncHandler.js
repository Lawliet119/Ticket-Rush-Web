/**
 * Wrapper for async middleware to catch errors and pass them to the global error handler
 * @param {Function} fn - Async middleware function
 * @returns {Function} Middleware function
 */
const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}

module.exports = asyncHandler
