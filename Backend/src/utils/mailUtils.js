'use strict'

const nodemailer = require('nodemailer')

const sendEmail = async ({ email, subject, html }) => {
    // 1. Tạo transporter (Người vận chuyển)
    // Nếu bạn có tài khoản SMTP (như Mailtrap, SendGrid, Gmail), hãy điền vào đây.
    // Tạm thời tôi để cấu hình mẫu cho Mailtrap hoặc Gmail.
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.mailtrap.io",
        port: process.env.MAIL_PORT || 2525,
        auth: {
            user: process.env.MAIL_USER, // Tên đăng nhập
            pass: process.env.MAIL_PASS  // Mật khẩu / App Password
        }
    })

    // 2. Cấu hình nội dung mail
    const mailOptions = {
        from: '"TicketRush Support" <support@ticketrush.com>',
        to: email,
        subject: subject,
        html: html
    }

    // 3. Gửi mail
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
