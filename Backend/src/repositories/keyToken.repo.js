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

module.exports = {
    createKeyToken,
    findByUserId,
    removeKeyByUserId
}
