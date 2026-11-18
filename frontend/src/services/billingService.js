import api from './api';

export const billingService = {
  checkout: async (checkoutPayload) => {
    const res = await api.post('/invoices/checkout/', checkoutPayload);
    return res.data;
  },

  getInvoices: async (params = {}) => {
    const res = await api.get('/invoices/', { params });
    return res.data;
  },

  getInvoiceById: async (id) => {
    const res = await api.get(`/invoices/${id}/`);
    return res.data;
  },

  getInvoicePdfUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_URL || '/api';
    return `${baseURL}/invoices/${id}/pdf/`;
  },
};
