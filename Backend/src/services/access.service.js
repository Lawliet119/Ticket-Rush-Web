'use strict'
const { findUserByEmail, createUser, updatePasswordResetToken, findUserByResetToken, updatePassword } = require('../repositories/user.repo')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../utils/authUtils')
const { BadRequestError, ConflictRequestError, NotFoundError, AuthFailureError } = require('../core/error.response')
const { validatePassword, validateEmail } = require('../utils/validator')
const { sendEmail } = require('../utils/mailUtils')
const JWT = require('jsonwebtoken')

class AccessService {
    
    /**
     * Send a password reset email to the user
     * @param {string} email - User email address
     * @returns {Promise<boolean>} True if successful
     */
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

    /**
     * Reset user password using a valid token
     * @param {string} token - Password reset token
     * @param {string} newPassword - New password string
     * @returns {Promise<boolean>} True if successful
     */
    static resetPassword = async (token, newPassword) => {
        // 0. Validate new password strength
        const passwordError = validatePassword(newPassword)
        if (passwordError) throw new BadRequestError(passwordError)

        // 1. Find user by valid token
        const user = await findUserByResetToken(token)
        if (!user) throw new BadRequestError('Invalid or expired reset token')

        // 2. Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10)

        // 3. Update DB
        await updatePassword(user.id, passwordHash)

        return true
    }

    /**
     * Authenticate user and generate token pair
     * @param {Object} params - Login parameters
     * @param {string} params.email - User email
     * @param {string} params.password - User password
     * @returns {Promise<Object>} Object containing user info and tokens
     */
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

    /**
     * Register a new user and generate token pair
     * @param {Object} params - Signup parameters
     * @param {string} params.name - User full name
     * @param {string} params.email - User email
     * @param {string} params.password - User password
     * @returns {Promise<Object>} Object containing user info and tokens
     */
    static signUp = async ({ name, email, password }) => {
        // 0. Validate input
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            throw new BadRequestError('Full name must be at least 2 characters')
        }

        const emailError = validateEmail(email)
        if (emailError) throw new BadRequestError(emailError)

        const passwordError = validatePassword(password)
        if (passwordError) throw new BadRequestError(passwordError)

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

    /**
     * Logout user by removing their key record
     * @param {string} userId - ID of the user to logout
     * @returns {Promise<Object>} Deletion result
     */
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
    /**
     * Handle Refresh Token rotation and detect reuse
     * @param {string} refreshToken - Current refresh token
     * @returns {Promise<Object>} New token pair and userId
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