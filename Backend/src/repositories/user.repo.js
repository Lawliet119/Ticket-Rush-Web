'use strict'
const prisma = require('../config/prisma')

const findUserByEmail = async (email) => {
    return await prisma.users.findUnique({
        where: { email }
    })
}

const createUser = async (data) => {
    return await prisma.users.create({
        data
    })
}

const findUserById = async (id) => {
    return await prisma.users.findUnique({
        where: { id }
    })
}

const updatePasswordResetToken = async (email, token, expires) => {
    return await prisma.users.update({
        where: { email },
        data: {
            password_reset_token: token,
            password_reset_expires: expires
        }
    })
}

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

module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    updatePasswordResetToken,
    findUserByResetToken,
    updatePassword
}
