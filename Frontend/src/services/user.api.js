import http from '../lib/http';

/**
 * Get profile of current authenticated user
 * @returns {Promise<Object>} User profile object
 */
export const getProfileApi = async () => {
    const res = await http.get('/users/profile');
    return res.data;
};

/**
 * Update user profile (supports image upload for avatar)
 * @param {FormData} formData - Profile data including avatar
 * @returns {Promise<Object>} Updated profile data
 */
export const updateProfileApi = async (formData) => {
    const res = await http.put('/users/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};
