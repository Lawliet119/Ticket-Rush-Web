'use strict'
const prisma = require('../config/prisma')

class UserService {
    static getProfile = async (userId) => {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, full_name: true, role: true,
                date_of_birth: true, gender: true, avatar_url: true,
                phone: true, age: true
            }
        });
        return user;
    }

    static updateProfile = async (userId, payload) => {
        let age = payload.age ? parseInt(payload.age, 10) : undefined;
        
        // Auto-calculate age if date_of_birth is provided
        if (payload.date_of_birth) {
            const dob = new Date(payload.date_of_birth);
            const ageDiffMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDiffMs); 
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        const updateData = {};
        if (payload.full_name) updateData.full_name = payload.full_name;
        if (payload.gender) updateData.gender = payload.gender;
        if (payload.phone) updateData.phone = payload.phone;
        if (payload.date_of_birth) updateData.date_of_birth = new Date(payload.date_of_birth);
        if (payload.avatar_url) updateData.avatar_url = payload.avatar_url;
        if (age !== undefined) updateData.age = age;

        return await prisma.users.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true, email: true, full_name: true, role: true,
                date_of_birth: true, gender: true, avatar_url: true,
                phone: true, age: true
            }
        });
    }
}
module.exports = UserService;
