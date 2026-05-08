'use strict'
const prisma = require('../config/prisma')

/**
 * Upsert a key token record for a user
 * @param {Object} params - Key data
 * @returns {Promise<Object>} Created or updated key record
 */
const createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    return await prisma.key_tokens.upsert({
        where: { user_id: userId },
        update: {
            public_key: publicKey,
            private_key: privateKey,
            refresh_token: refreshToken,
            refresh_tokens_used: []
        },
        create: {
            user_id: userId,
            public_key: publicKey,
            private_key: privateKey,
            refresh_token: refreshToken
        }
    })
}

/**
 * Find key record by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Key record
 */
const findByUserId = async (userId) => {
    return await prisma.key_tokens.findUnique({
        where: { user_id: userId }
    })
}

/**
 * Remove key record for a user (Logout)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
const removeKeyByUserId = async (userId) => {
    return await prisma.key_tokens.delete({
        where: { user_id: userId }
    })
}

// Find key_token record by its current active refresh token
/**
 * Find key record by current active refresh token
 * @param {string} refreshToken - Active refresh token
 * @returns {Promise<Object>} Key record
 */
const findByRefreshToken = async (refreshToken) => {
    return await prisma.key_tokens.findFirst({
        where: { refresh_token: refreshToken }
    })
}

// Check if a refresh token has been used before (Token Reuse Detection)
/**
 * Find record where a refresh token has already been used
 * @param {string} refreshToken - Used refresh token
 * @returns {Promise<Object>} Key record
 */
const findByRefreshTokenUsed = async (refreshToken) => {
    return await prisma.key_tokens.findFirst({
        where: { refresh_tokens_used: { has: refreshToken } }
    })
}

// Rotate refresh token: archive old one, save new one
/**
 * Rotate refresh tokens: archive old, set new
 * @param {string} userId - User ID
 * @param {string} oldRefreshToken - Token to archive
 * @param {string} newRefreshToken - New active token
 * @returns {Promise<Object>} Update result
 */
const updateRefreshToken = async (userId, oldRefreshToken, newRefreshToken) => {
    return await prisma.key_tokens.update({
        where: { user_id: userId },
        data: {
            refresh_token: newRefreshToken,
            refresh_tokens_used: { push: oldRefreshToken }
        }
    })
}

module.exports = {
    createKeyToken,
    findByUserId,
    removeKeyByUserId,
    findByRefreshToken,
    findByRefreshTokenUsed,
    updateRefreshToken
}
