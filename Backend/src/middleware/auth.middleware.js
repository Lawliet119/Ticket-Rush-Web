'use strict'

const JWT = require('jsonwebtoken')
const { AuthFailureError, NotFoundError, ForbiddenError } = require('../core/error.response')
const { findUserById } = require('../repositories/user.repo')

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

/**
 * Authentication middleware to verify user tokens
 * This is the 'gatekeeper' for protected routes
 */
const authentication = async (req, res, next) => {
    // 1. Check userId from headers
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request: Client-ID missing')

    // 2. Lookup keyStore (Token verification keys)
    const KeyTokenService = require('../services/keyToken.service')
    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Session not found: Please login again')

    // 3. Get AccessToken from headers
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request: Authorization token missing')

    // 4. Verify token integrity and ownership
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.public_key, { algorithms: ['RS256'] })
        
        // Security check: Ensure token belongs to the claiming userId
        if (userId !== decodeUser.userId) throw new AuthFailureError('Security violation: Invalid User ID')

        // 5. Fetch full user data to ensure account is still active and get current role
        const user = await findUserById(userId)
        if (!user) throw new NotFoundError('User account no longer exists')

        // Attach verified objects to request for use in controllers
        req.keyStore = keyStore
        req.user = user 
        req.userId = userId

        return next()
    } catch (error) {
        throw new AuthFailureError('Authentication failed: Invalid or expired token')
    }
}

/**
 * RBAC Middleware: Check if user has required roles
 * @param {Array<string>} roles - List of allowed roles (e.g., ['ADMIN', 'MANAGER'])
 */
const checkRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ForbiddenError('Access Denied: You do not have permission for this action')
        }
        next()
    }
}

module.exports = {
    authentication,
    checkRole
}
