import api from './api';

const ordersService = {
  create: (data) => api.post('/orders/orders/', data),
  getAll: () => api.get('/orders/orders/'),
  getById: (id) => api.get(`/orders/orders/${id}/`),
  buyerUpdate: (id, data) => api.patch(`/orders/orders/${id}/buyer_update/`, data),
  cancel: (id) => api.post(`/orders/orders/${id}/cancel/`),
  getPurchases: () => api.get('/marketplace/orders/purchases/'), 
  getSales: () => api.get('/marketplace/orders/sales/'),       
};


export default ordersService;