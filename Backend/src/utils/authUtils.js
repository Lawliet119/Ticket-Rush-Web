'use strict'
const JWT = require('jsonwebtoken')
const { AuthFailureError, NotFoundError, ForbiddenError } = require('../core/error.response')
const { findUserById } = require('../repositories/user.repo')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h'
        })

        const refreshToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        })  

        return {
            accessToken,
            refreshToken
        }
    } catch (error){
        console.error("createTokenPair error::", error)
        throw error
    }
}

const authentication = async (req, res, next) => {
    // 1. Check userId
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    // 2. Lookup keyStore
    const KeyTokenService = require('../services/keyToken.service')
    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')

    // 3. Get AccessToken
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')

    // 4. Verify token
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.public_key, { algorithms: ['RS256'] })
        
        // userId check
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User ID')

        // 5. Fetch user from DB to get latest role
        const user = await findUserById(userId)
        if (!user) throw new NotFoundError('User not found')

        // attach objects into req
        req.keyStore = keyStore
        req.user = user // Now contains role
        req.userId = userId

        return next()
    } catch (error) {
        throw new AuthFailureError('Invalid Token')
    }
}

const checkRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ForbiddenError('You do not have permission to perform this action')
        }
        next()
    }
}

module.exports = {
    createTokenPair,
    authentication,
    checkRole
}