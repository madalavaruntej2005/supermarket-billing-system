import api from './api';

export const inventoryService = {
  getMovements: async (params = {}) => {
    const res = await api.get('/inventory/movements/', { params });
    return res.data;
  },

  getLowStockProducts: async () => {
    const res = await api.get('/inventory/low-stock/');
    return res.data;
  },

  adjustStock: async (payload) => {
    const res = await api.post('/inventory/adjust/', payload);
    return res.data;
  },
};
