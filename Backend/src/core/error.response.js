    'use strict'

    const StatusCode = {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        CONFLICT: 409
    }

    const ReasonStatusCode = {
        BAD_REQUEST: 'Bad request error',
        FORBIDDEN: 'Forbidden',
        CONFLICT: 'Conflict error'
    }

   

    /**
     * Base error response class
     */
    class ErrorResponse extends Error {
        constructor(message, status){
            super(message)
            this.status = status
        }

    }

    /**
     * Error for 409 Conflict requests
     */
    class ConflictRequestError extends ErrorResponse {
        constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT){
            super(message, statusCode)
        }
    }

    /**
     * Error for 400 Bad Requests
     */
    class BadRequestError extends ErrorResponse {
        constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) {
            super(message, statusCode)
        }
    }

    /**
     * Error for 401 Unauthorized requests
     */
    class AuthFailureError extends ErrorResponse {
        constructor(message = 'Unauthorized', statusCode = 401) {
            super(message, statusCode)
        }
    }

    /**
     * Error for 404 Not Found requests
     */
    class NotFoundError extends ErrorResponse {
        constructor(message = 'Not Found', statusCode = 404) {
            super(message, statusCode)
        }
    }

    /**
     * Error for 403 Forbidden requests
     */
    class ForbiddenError extends ErrorResponse {
        constructor(message = 'Forbidden', statusCode = 403) {
            super(message, statusCode)
        }
    }

    module.exports = {
        ConflictRequestError,
        BadRequestError,
        AuthFailureError,
        NotFoundError,
        ForbiddenError
    }
