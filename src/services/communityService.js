// // Community API Service - Notifications and Reviews
// import api from "./api";

// const communityService = {
//   // ========== NOTIFICATIONS ==========
//   notifications: {
//     getAll: (params) => api.get("/community/notifications/", { params }),
//     getUnreadCount: () => api.get("/community/notifications/unread_count/"),
//     markAsRead: (id) =>
//       api.post(`/community/notifications/${id}/mark_as_read/`),
//   },

//   // ========== REVIEWS ==========
//   reviews: {
//     getAll: (params) => api.get("/community/reviews/", { params }),
//     create: (data) => api.post("/community/reviews/", data),
//   },
// };

// export default communityService;
// export { markAsRead };

// Community API Service - Notifications and Reviews
import api from "./api";

const communityService = {
  // ========== NOTIFICATIONS ==========
  notifications: {
    getAll: (params) => api.get("/community/notifications/", { params }),
    // Try common notification unread-count endpoints to avoid 404s
    getUnreadCount: async () => {
      const endpoints = ["/community/notifications/unread_count/"];
      for (const ep of endpoints) {
        try {
          const res = await api.get(ep);
          return res;
        } catch (err) {
          if (!err.response || err.response.status >= 500) throw err;
        }
      }
      // fallback to empty count
      return { data: { count: 0 } };
    },
    markAsRead: (id) =>
      api.post(`/community/notifications/${id}/mark_as_read/`),
    markAllAsRead: () => api.post("/community/notifications/mark_all_as_read/"),
  },

  // ========== REVIEWS ==========
  reviews: {
    getAll: (params) => api.get("/community/reviews/", { params }),
    create: (data) => api.post("/community/reviews/", data),
  },
};

export default communityService;
