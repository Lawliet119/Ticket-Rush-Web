'use strict'
const prisma = require('../config/prisma')

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

const findByUserId = async (userId) => {
    return await prisma.key_tokens.findUnique({
        where: { user_id: userId }
    })
}

const removeKeyByUserId = async (userId) => {
    return await prisma.key_tokens.delete({
        where: { user_id: userId }
    })
}

// Find key_token record by its current active refresh token
const findByRefreshToken = async (refreshToken) => {
    return await prisma.key_tokens.findFirst({
        where: { refresh_token: refreshToken }
    })
}

// Check if a refresh token has been used before (Token Reuse Detection)
const findByRefreshTokenUsed = async (refreshToken) => {
    return await prisma.key_tokens.findFirst({
        where: { refresh_tokens_used: { has: refreshToken } }
    })
}

// Rotate refresh token: archive old one, save new one
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
