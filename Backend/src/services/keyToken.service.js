'use strict'
const { 
    createKeyToken, findByUserId, removeKeyByUserId,
    findByRefreshToken, findByRefreshTokenUsed, updateRefreshToken 
} = require('../repositories/keyToken.repo')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            const publicKeyString = publicKey.toString()
            const privateKeyString = privateKey ? privateKey.toString() : null
            
            const tokens = await createKeyToken({
                userId,
                publicKey: publicKeyString,
                privateKey: privateKeyString,
                refreshToken
            })

            return tokens ? tokens.public_key : null
        } catch (error) {
            console.error("KeyTokenService error::", error)
            return null
        }
    }

    static findByUserId = async (userId) => {
        return await findByUserId(userId)
    }

    static removeKeyByUserId = async (userId) => {
        return await removeKeyByUserId(userId)
    }

    static findByRefreshToken = async (refreshToken) => {
        return await findByRefreshToken(refreshToken)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await findByRefreshTokenUsed(refreshToken)
    }

    static updateRefreshToken = async (userId, oldRefreshToken, newRefreshToken) => {
        return await updateRefreshToken(userId, oldRefreshToken, newRefreshToken)
    }
}

module.exports = KeyTokenService