const { 
    findUserByEmail, 
    createUser, 
    updatePasswordResetToken, 
    findUserByResetToken, 
    updatePassword,
    findUserByVerificationToken,
    verifyUser,
    updateVerificationToken
} = require('../repositories/user.repo')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../utils/authUtils')
const { BadRequestError, ConflictRequestError, NotFoundError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { validatePassword, validateEmail } = require('../utils/validator')
const { sendEmail } = require('../utils/mailUtils')
const { getVerifyEmailTemplate, getForgotPasswordTemplate } = require('../utils/mailTemplates')
const JWT = require('jsonwebtoken')

class AccessService {
    /**
     * Resend verification email
     */
    static resendVerification = async (email) => {
        // 1. Check user exists
        const user = await findUserByEmail(email)
        if (!user) throw new NotFoundError('User not registered')

        // 2. Check if already active
        if (user.is_active) {
            throw new BadRequestError('Account is already verified. Please log in.')
        }

        // 3. Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // 4. Update DB
        await updateVerificationToken(email, verificationToken, verificationExpires)

        // 5. Send email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`

        await sendEmail({
            email,
            subject: 'TicketRush - Verify Your Email (Resend)',
            html: getVerifyEmailTemplate(verifyUrl)
        })

        return true
    }

    
    /**
     * Send a password reset email to the user
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
        
        await sendEmail({
            email,
            subject: 'TicketRush - Reset Your Password',
            html: getForgotPasswordTemplate(resetUrl)
        })

        return true
    }

    /**
     * Reset user password
     */
    static resetPassword = async (token, newPassword) => {
        const passwordError = validatePassword(newPassword)
        if (passwordError) throw new BadRequestError(passwordError)

        const user = await findUserByResetToken(token)
        if (!user) throw new BadRequestError('Invalid or expired reset token')

        const passwordHash = await bcrypt.hash(newPassword, 10)
        await updatePassword(user.id, passwordHash)

        return true
    }

    /**
     * Authenticate user
     */
    static logIn = async ({ email, password }) => {
        const foundUser = await findUserByEmail(email)
        if (!foundUser) throw new BadRequestError('User not registered')

        // CHECK IF USER IS ACTIVE (VERIFIED)
        if (!foundUser.is_active) {
            throw new ForbiddenError('Please verify your email before logging in')
        }

        const match = await bcrypt.compare(password, foundUser.password_hash)
        if (!match) throw new BadRequestError('Authentication error')

        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
        })

        const tokens = await createTokenPair({ userId: foundUser.id, email }, publicKey, privateKey)

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
     * Register a new user with email verification
     */
    static signUp = async ({ name, email, password }) => {
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            throw new BadRequestError('Full name must be at least 2 characters')
        }

        const emailError = validateEmail(email)
        if (emailError) throw new BadRequestError(emailError)

        const passwordError = validatePassword(password)
        if (passwordError) throw new BadRequestError(passwordError)

        const holderUser = await findUserByEmail(email)
        if (holderUser) {
            throw new ConflictRequestError('User already exists')
        }

        const passwordHash = await bcrypt.hash(password, 10)

        // 1. Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // 2. Create user as NOT active
        const newUser = await createUser({
            full_name: name,
            email: email,
            password_hash: passwordHash,
            is_active: false, // Force false
            verification_token: verificationToken,
            verification_expires: verificationExpires
        })

        if (!newUser) throw new BadRequestError('Failed to create user')

        // 3. Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`

        await sendEmail({
            email,
            subject: 'TicketRush - Verify Your Email',
            html: getVerifyEmailTemplate(verifyUrl)
        })

        return {
            message: 'Registration success! Please check your email to verify your account.'
        }
    }

    /**
     * Verify user email using token
     */
    static verifyEmail = async (token) => {
        // 1. Find user by token (regardless of expiry for a moment to check status)
        const user = await findUserByVerificationToken(token)
        
        if (!user) {
          
            throw new BadRequestError('Invalid or expired verification token')
        }

        // 2. Mark as verified
        await verifyUser(user.id)

        return true
    }


    static logout = async (userId) => {
        const delKey = await KeyTokenService.removeKeyByUserId(userId)
        return delKey
    }

    static handleRefreshToken = async (refreshToken) => {
        const foundUsedToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if (foundUsedToken) {
            await KeyTokenService.removeKeyByUserId(foundUsedToken.user_id)
            throw new AuthFailureError('Token reuse detected! Please login again.')
        }

        const keyStore = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!keyStore) throw new AuthFailureError('Invalid refresh token')

        let decoded
        try {
            decoded = JWT.verify(refreshToken, keyStore.public_key, { algorithms: ['RS256'] })
        } catch (err) {
            throw new AuthFailureError('Refresh token expired or invalid')
        }

        const tokens = await createTokenPair(
            { userId: decoded.userId, email: decoded.email },
            keyStore.public_key,
            keyStore.private_key
        )

        await KeyTokenService.updateRefreshToken(
            keyStore.user_id,
            refreshToken,
            tokens.refreshToken
        )

        return {
            userId: decoded.userId,
            tokens
        }
    }
}

module.exports = AccessService
