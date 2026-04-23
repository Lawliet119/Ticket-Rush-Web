require('dotenv').config();
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function initAdmin() {
    try {
        console.log('Đang khởi tạo tài khoản Admin...');
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        const admin = await prisma.users.upsert({
            where: { email: 'admin@ticketrush.com' },
            update: {
                role: 'ADMIN',
                password_hash: passwordHash
            },
            create: {
                email: 'admin@ticketrush.com',
                full_name: 'System Admin',
                password_hash: passwordHash,
                role: 'ADMIN'
            }
        });

        console.log('-----------------------------------');
        console.log('TÀI KHOẢN ADMIN ĐÃ SẴN SÀNG!');
        console.log('Email: admin@ticketrush.com');
        console.log('Password: admin123');
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Lỗi khi khởi tạo Admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

initAdmin();
