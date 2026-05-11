'use strict'
const JWT = require('jsonwebtoken')

/**
 * Auth Utilities
 * Contains helper functions for token generation and management.
 */

/**
 * Create a pair of Access Token and Refresh Token
 * @param {Object} payload - Data to be encoded in the token
 * @param {string} publicKey - Public key for verification
 * @param {string} privateKey - Private key for signing
 * @returns {Promise<Object>} Object containing accessToken and refreshToken
 */
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

/**
 * Set refresh token as an HTTP-only cookie for secure persistence
 * @param {Object} res - Express response object
 * @param {string} refreshToken - The refresh token string
 */
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}

module.exports = {
    createTokenPair,
    setRefreshTokenCookie
}