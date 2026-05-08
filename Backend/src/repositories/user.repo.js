'use strict'
const prisma = require('../config/prisma')

/**
 * Find user record by email
 * @param {string} email - User email address
 * @returns {Promise<Object>} User record
 */
const findUserByEmail = async (email) => {
    return await prisma.users.findUnique({
        where: { email }
    })
}

/**
 * Create a new user record
 * @param {Object} data - User data
 * @returns {Promise<Object>} Created user record
 */
const createUser = async (data) => {
    return await prisma.users.create({
        data
    })
}

/**
 * Find user record by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User record
 */
const findUserById = async (id) => {
    return await prisma.users.findUnique({
        where: { id }
    })
}

/**
 * Update user's password reset token and expiry
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {Date} expires - Token expiry date
 * @returns {Promise<Object>} Update result
 */
const updatePasswordResetToken = async (email, token, expires) => {
    return await prisma.users.update({
        where: { email },
        data: {
            password_reset_token: token,
            password_reset_expires: expires
        }
    })
}

/**
 * Find user by a valid (non-expired) reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} User record
 */
const findUserByResetToken = async (token) => {
    return await prisma.users.findFirst({
        where: {
            password_reset_token: token,
            password_reset_expires: {
                gt: new Date()
            }
        }
    })
}

/**
 * Update user's password hash and clear reset token
 * @param {string} userId - User ID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<Object>} Update result
 */
const updatePassword = async (userId, newPasswordHash) => {
    return await prisma.users.update({
        where: { id: userId },
        data: {
            password_hash: newPasswordHash,
            password_reset_token: null, 
            password_reset_expires: null
        }
    })
}

const USER_SELECT_FIELDS = {
    id: true, email: true, full_name: true, role: true,
    date_of_birth: true, gender: true, avatar_url: true,
    phone: true, age: true
};

/**
 * Retrieve user profile fields (excludes sensitive data like password)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getUserProfile = async (userId) => {
    return await prisma.users.findUnique({
        where: { id: userId },
        select: USER_SELECT_FIELDS
    });
}

/**
 * Update user profile fields
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated profile
 */
const updateUserProfile = async (userId, updateData) => {
    return await prisma.users.update({
        where: { id: userId },
        data: updateData,
        select: USER_SELECT_FIELDS
    });
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    updatePasswordResetToken,
    findUserByResetToken,
    updatePassword,
    getUserProfile,
    updateUserProfile
}
