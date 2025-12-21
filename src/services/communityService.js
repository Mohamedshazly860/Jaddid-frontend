// Community API Service - Notifications and Reviews
import api from "./api";

const communityService = {
  // ========== NOTIFICATIONS ==========
  notifications: {
    getAll: (params) => api.get("/community/notifications/", { params }),
    getUnreadCount: () => api.get("/community/notifications/unread-count/"),
    markAsRead: (id) =>
      api.post(`/community/notifications/${id}/mark_as_read/`),
  },

  // ========== REVIEWS ==========
  reviews: {
    getAll: (params) => api.get("/community/reviews/", { params }),
    create: (data) => api.post("/community/reviews/", data),
  },
};

export default communityService;
