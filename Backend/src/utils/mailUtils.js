'use strict'

const nodemailer = require('nodemailer')

const sendEmail = async ({ email, subject, html }) => {
    
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.mailtrap.io",
        port: process.env.MAIL_PORT || 2525,
        auth: {
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASS  
        }
    })

  
    const mailOptions = {
        from: '"TicketRush Support" <support@ticketrush.com>',
        to: email,
        subject: subject,
        html: html
    }

    
    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ' + info.messageId)
        return info
    } catch (error) {
        console.error('Email send error:', error)
        throw new Error('Could not send email')
    }
}

module.exports = {
    sendEmail
}
