import api from "./api";

const tryEndpoints = async (endpoints, config) => {
  for (const ep of endpoints) {
    try {
      console.debug(`[ordersService] trying GET ${ep}`);
      const res = await api.get(ep, config);
      console.debug(`[ordersService] success GET ${ep} ->`, res.status);
      return res;
    } catch (err) {
      const status = err.response?.status;
      console.debug(
        `[ordersService] failed GET ${ep} -> ${status ?? err.code}`,
        err.response?.data || err.message
      );
      // continue trying next endpoint on 4xx/5xx
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  console.warn("[ordersService] all GET endpoints failed", endpoints);
  throw new Error("All endpoints failed");
};

const tryPostEndpoints = async (endpoints, data, config) => {
  for (const ep of endpoints) {
    try {
      console.debug(`[ordersService] trying POST ${ep}`);
      const res = await api.post(ep, data, config);
      console.debug(`[ordersService] success POST ${ep} ->`, res.status);
      return res;
    } catch (err) {
      const status = err.response?.status;
      console.debug(
        `[ordersService] failed POST ${ep} -> ${status ?? err.code}`,
        err.response?.data || err.message
      );
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  console.warn("[ordersService] all POST endpoints failed", endpoints);
  throw new Error("All POST endpoints failed");
};

const ordersService = {
  create: async (data) => {
    const orderResponse = await api.post("/orders/orders/", data);
    const order = orderResponse.data;

    console.log("[ordersService] Order created. Response data:", order);

    // FIX: Check if the ID is 'id' or 'order_id'
    const idToUse = order.id || order.order_id;

    if (idToUse) {
      try {
        const assignRes = await ordersService.assignCourier(idToUse);
        console.log("Assignment Success:", assignRes.data);

        // If the assignment worked, start the simulation!
        const assignmentId = assignRes.data.assignment?.id;
        if (assignmentId) {
          console.log("Starting Simulation for Assignment:", assignmentId);
          await ordersService.startDelivery(assignmentId);
        }
      } catch (err) {
        console.error("Post-creation logistics failed:", err);
      }
    }

    return orderResponse;
  },
  getAll: () => api.get("/orders/orders/"),

  // Simplify getById to use the confirmed working path
  getById: async (orderId) => {
    return api.get(`/orders/orders/${orderId}/`);
  },

  // Convenience wrapper to fetch a single order (alias)
  getOrder: async (orderId) => ordersService.getById(orderId),

  // FIXED: Tracking endpoint - includes /logistics/ prefix
  getTracking: async (orderId) => {
    const endpoints = [
      `/logistics/tracking/${orderId}/`,
      `/logistics/tracking/${orderId}`,
    ];
    return tryEndpoints(endpoints);
  },

  // FIXED: Assign courier - correct path is /logistics/order/{id}/assign/
  assignCourier: async (orderId, data = {}) => {
    // Ensure this orderId is not undefined!
    console.debug(`[ordersService] Manual call to assign for ID: ${orderId}`);

    const endpoints = [
      `/logistics/order/${orderId}/assign/`, // Matches your path('order/<str:order_id>/assign/')
    ];
    return tryPostEndpoints(endpoints, data);
  },

  // FIXED: Start delivery - correct path is /logistics/assignment/{id}/start/
  startDelivery: async (assignmentId) => {
    // Stick to the one that worked in your URL pattern
    return api.post(`/logistics/assignment/${assignmentId}/start/`);
  },

  buyerUpdate: (id, data) =>
    api.patch(`/orders/orders/${id}/buyer_update/`, data),

  cancel: (id) => api.post(`/orders/orders/${id}/cancel/`),

  getPurchases: () => api.get("/orders/orders/"),
  getSales: () => api.get("/orders/orders/"),
};

export default ordersService;
