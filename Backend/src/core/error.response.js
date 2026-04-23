    'use strict'

    const StatusCode = {
        FORBIDDEN: 403,
        CONFLICT: 409
    }

    const ReasonStatusCode = {
        FORBIDDEN: 'Bad request error',
        CONFLICT: 'Conflict error'
    }

   

    class ErrorResponse extends Error {
        constructor(message, status){
            super(message)
            this.status = status
        }

    }

    class ConflictRequestError extends ErrorResponse {
        constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT){
            super(message, statusCode)
        }
    }

    class BadRequestError extends ErrorResponse {
        constructor(message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
            super(message, statusCode)
        }
    }

    class AuthFailureError extends ErrorResponse {
        constructor(message = 'Unauthorized', statusCode = 401) {
            super(message, statusCode)
        }
    }

    class NotFoundError extends ErrorResponse {
        constructor(message = 'Not Found', statusCode = 404) {
            super(message, statusCode)
        }
    }

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
