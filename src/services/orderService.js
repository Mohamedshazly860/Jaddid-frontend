import api from "./api";

const orderService = {
  create: (data) => api.post("/orders/orders/", data),
  getOrder: (orderId) => api.get(`/orders/orders/${orderId}/`),
  getTracking: (orderId) => api.get(`/logistics/tracking/${orderId}/`),
  assignCourier: (orderId, data = {}) =>
    api.post(`/order/${orderId}/assign/`, data),
  startDelivery: (assignmentId, data = {}) =>
    api.post(`/assignment/${assignmentId}/start/`, data),
  confirm: (orderId) => api.post(`/orders/orders/${orderId}/confirm/`),
};

export default orderService;
