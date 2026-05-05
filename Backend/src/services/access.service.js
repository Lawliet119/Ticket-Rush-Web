'use strict'
const { findUserByEmail, createUser, updatePasswordResetToken, findUserByResetToken, updatePassword } = require('../repositories/user.repo')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../utils/authUtils')
const { BadRequestError, ConflictRequestError, NotFoundError, AuthFailureError } = require('../core/error.response')
const { sendEmail } = require('../utils/mailUtils')
const JWT = require('jsonwebtoken')

class AccessService {
    
    static forgotPassword = async (email) => {
        // 1. Check user exists
        const user = await findUserByEmail(email)
        if (!user) throw new NotFoundError('User not registered')

        // 2. Generate random token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

        // 3. Save to DB
        await updatePasswordResetToken(email, resetToken, resetTokenExpires)

        // 4. Send email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`
        const html = `
            <h3>Reset Password Request</h3>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
        `
        
        await sendEmail({
            email,
            subject: 'TicketRush - Reset Your Password',
            html
        })

        return true
    }

    static resetPassword = async (token, newPassword) => {
        // 1. Find user by valid token
        const user = await findUserByResetToken(token)
        if (!user) throw new BadRequestError('Invalid or expired reset token')

        // 2. Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10)

        // 3. Update DB
        await updatePassword(user.id, passwordHash)

        return true
    }

    static logIn = async ({ email, password }) => {
        // 1. Check user exists
        const foundUser = await findUserByEmail(email)
        if (!foundUser) throw new BadRequestError('User not registered')

        // 2. Match password
        const match = await bcrypt.compare(password, foundUser.password_hash)
        if (!match) throw new BadRequestError('Authentication error')

        // 3. Create privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
        })

        // 4. Generate tokens
        const tokens = await createTokenPair({ userId: foundUser.id, email }, publicKey, privateKey)

        // 5. Save tokens
        await KeyTokenService.createKeyToken({
            userId: foundUser.id,
            refreshToken: tokens.refreshToken,
            privateKey, 
            publicKey
        })

        return {
            user: { 
                id: foundUser.id, 
                email: foundUser.email, 
                name: foundUser.full_name,
                role: foundUser.role 
            },
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        // 1. Check if user already exists
        const holderUser = await findUserByEmail(email)
        if (holderUser) {
            throw new ConflictRequestError('User already exists')
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // 3. Create new user
        const newUser = await createUser({
            full_name: name,
            email: email,
            password_hash: passwordHash
        })

        if (!newUser) {
            throw new BadRequestError('Failed to create user')
        }

        // 4. Generate tokens right after signing up
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
        })
        
        const tokens = await createTokenPair({ userId: newUser.id, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId: newUser.id,
            refreshToken: tokens.refreshToken,
            privateKey, 
            publicKey
        })

        return {
            user: { 
                id: newUser.id, 
                email: newUser.email, 
                name: newUser.full_name,
                role: newUser.role
            },
            tokens
        }
    }

    static logout = async (userId) => {
        const delKey = await KeyTokenService.removeKeyByUserId(userId)
        return delKey
    }

    /**
     * Handle Refresh Token
     * - Read refresh token from HttpOnly cookie
     * - If token found in refresh_tokens_used → Token Reuse Attack detected → Delete all tokens
     * - If token is the current active one → Verify, rotate, return new pair
     */
    static handleRefreshToken = async (refreshToken) => {
        // 1. Check if this refresh token has been used before (STOLEN TOKEN DETECTION)
        const foundUsedToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if (foundUsedToken) {
            // Someone is reusing an old token! Delete all tokens for this user immediately
            await KeyTokenService.removeKeyByUserId(foundUsedToken.user_id)
            throw new AuthFailureError('Token reuse detected! Please login again.')
        }

        // 2. Find the key_token record that has this as its current active refresh token
        const keyStore = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!keyStore) {
            throw new AuthFailureError('Invalid refresh token')
        }

        // 3. Verify the refresh token using the stored public key
        let decoded
        try {
            decoded = JWT.verify(refreshToken, keyStore.public_key, { algorithms: ['RS256'] })
        } catch (err) {
            throw new AuthFailureError('Refresh token expired or invalid')
        }

        // 4. Generate new token pair using the SAME keypair (no need to regenerate RSA keys)
        const tokens = await createTokenPair(
            { userId: decoded.userId, email: decoded.email },
            keyStore.public_key,
            keyStore.private_key
        )

        // 5. Rotate: archive old refresh token, save new one
        await KeyTokenService.updateRefreshToken(
            keyStore.user_id,
            refreshToken,         // old token → push to refresh_tokens_used
            tokens.refreshToken   // new token → set as current active
        )

        return {
            userId: decoded.userId,
            tokens
        }
    }
}

module.exports = AccessService