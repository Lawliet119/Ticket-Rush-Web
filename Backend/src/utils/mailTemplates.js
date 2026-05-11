'use strict'

/**
 * Return a simple clickable link for verification
 */
const getVerifyEmailTemplate = (verifyUrl) => {
    return `Click here to verify your account: <a href="${verifyUrl}">${verifyUrl}</a>`
}

/**
 * Return a simple clickable link for password reset
 */
const getForgotPasswordTemplate = (resetUrl) => {
    return `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
}


module.exports = {
    getVerifyEmailTemplate,
    getForgotPasswordTemplate
}
