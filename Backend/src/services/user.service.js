'use strict'
const { getUserProfile, updateUserProfile } = require('../repositories/user.repo')

class UserService {
    /**
     * Retrieve user profile information
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile object
     */
    static getProfile = async (userId) => {
        return await getUserProfile(userId);
    }

    /**
     * Update user profile information
     * @param {string} userId - User ID
     * @param {Object} payload - New profile data
     * @returns {Promise<Object>} Updated user profile object
     */
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

        return await updateUserProfile(userId, updateData);
    }
}
module.exports = UserService;
