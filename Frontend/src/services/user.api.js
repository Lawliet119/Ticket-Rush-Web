import http from '../lib/http';

export const getProfileApi = async () => {
    const res = await http.get('/users/profile');
    return res.data;
};

export const updateProfileApi = async (formData) => {
    const res = await http.put('/users/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};
