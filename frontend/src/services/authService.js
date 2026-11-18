import api from './api';

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile/');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile/', profileData);
    return res.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const res = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/users/');
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/users/', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(`/users/${id}/`, userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}/`);
    return res.data;
  },
};
