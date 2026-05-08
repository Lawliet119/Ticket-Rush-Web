'use strict'
const { 
    createKeyToken, findByUserId, removeKeyByUserId,
    findByRefreshToken, findByRefreshTokenUsed, updateRefreshToken 
} = require('../repositories/keyToken.repo')

class KeyTokenService {
    /**
     * Create or update a key record for a user
     * @param {Object} params - Key parameters
     * @param {string} params.userId - User ID
     * @param {string} params.publicKey - Public key string
     * @param {string} params.privateKey - Private key string
     * @param {string} params.refreshToken - Initial refresh token
     * @returns {Promise<string|null>} The public key string if successful
     */
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

    /**
     * Find key record by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Key record
     */
    static findByUserId = async (userId) => {
        return await findByUserId(userId)
    }

    /**
     * Remove key record by user ID (Logout)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Deletion result
     */
    static removeKeyByUserId = async (userId) => {
        return await removeKeyByUserId(userId)
    }

    /**
     * Find key record by current active refresh token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>} Key record
     */
    static findByRefreshToken = async (refreshToken) => {
        return await findByRefreshToken(refreshToken)
    }

    /**
     * Find user record if a refresh token was previously used (for detection)
     * @param {string} refreshToken - Used refresh token
     * @returns {Promise<Object>} User ID associated with the token
     */
    static findByRefreshTokenUsed = async (refreshToken) => {
        return await findByRefreshTokenUsed(refreshToken)
    }

    /**
     * Rotate refresh token: archive old one and set new one
     * @param {string} userId - User ID
     * @param {string} oldRefreshToken - Token to archive
     * @param {string} newRefreshToken - New token to activate
     * @returns {Promise<Object>} Update result
     */
    static updateRefreshToken = async (userId, oldRefreshToken, newRefreshToken) => {
        return await updateRefreshToken(userId, oldRefreshToken, newRefreshToken)
    }
}

module.exports = KeyTokenService