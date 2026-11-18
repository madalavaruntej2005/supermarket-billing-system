import api from './api';

export const reportService = {
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/stats/');
    return res.data;
  },

  getSalesReport: async (params = {}) => {
    const res = await api.get('/reports/sales/', { params });
    return res.data;
  },
};
