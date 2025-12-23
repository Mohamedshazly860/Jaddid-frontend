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
    getUnreadCount: () => api.get("/community/notifications/unread_count/"),
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
