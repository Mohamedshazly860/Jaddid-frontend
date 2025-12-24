// User & Profile API Service
import api from "./api";
import marketplaceService from "./marketplaceService";

const tryEndpoints = async (endpoints, config) => {
  for (const ep of endpoints) {
    try {
      const res = await api.get(ep, config);
      return res;
    } catch (err) {
      // continue trying next endpoint on 4xx/5xx
      if (!err.response || err.response.status >= 500) throw err;
    }
  }
  // if none succeeded, throw a generic error
  throw new Error("All endpoints failed");
};

const userService = {
  // Basic user endpoints (try common paths if backend varies)
  getCurrentUser: async () => {
    // direct endpoint for current user
    return api.get("/accounts/me/");
  },

  getUserById: async (id) => {
    const endpoints = [
      `/accounts/users/${id}/`,
      `/accounts/profile/${id}/`,
      `/accounts/user/${id}/`,
    ];
    return tryEndpoints(endpoints);
  },

  updateUser: (id, data) => {
    // support JSON or FormData - let axios set Content-Type for FormData
    return api.patch(`/accounts/users/${id}/`, data);
  },

  // Full replace (PUT) variants
  updateUserPut: (id, data) => {
    return api.put(`/accounts/users/${id}/`, data);
  },

  updateCurrentUser: (data) => {
    // backend provides a dedicated endpoint for partial updates
    return api.patch("/accounts/me/basic/", data);
  },

  updateCurrentUserPut: (data) => {
    // backend expects PUT on the /me/update/ route
    return api.put("/accounts/me/update/", data);
  },

  deleteCurrentUser: () => api.delete("/accounts/me/delete/"),

  // Profile-related wrappers
  getProfile: async (id) => {
    return userService.getUserById(id);
  },

  // Fetch products/listings/reviews belonging to a user using query params as a fallback
  getUserProducts: async (userId, params = {}) => {
    if (!userId) return Promise.resolve({ data: [] });
    const keys = ["owner", "user", "seller", "owner_id", "user_id"];
    for (const key of keys) {
      try {
        const res = await api.get("/marketplace/products/", {
          params: { ...params, [key]: userId },
        });
        // return first successful response
        if (res && (Array.isArray(res.data) ? true : res.data)) return res;
      } catch (err) {
        // try next key
      }
    }
    // fallback to unfiltered products (empty)
    return Promise.resolve({ data: [] });
  },

  getUserMaterialListings: async (userId, params = {}) => {
    if (!userId) return Promise.resolve({ data: [] });
    const keys = ["owner", "user", "seller", "owner_id", "user_id"];
    for (const key of keys) {
      try {
        const res = await api.get("/marketplace/material-listings/", {
          params: { ...params, [key]: userId },
        });
        if (res && (Array.isArray(res.data) ? true : res.data)) return res;
      } catch (err) {
        // try next key
      }
    }
    return Promise.resolve({ data: [] });
  },

  uploadProfileImage: (formData) => {
    return api.put("/accounts/profile/image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUserReviews: (userId) => {
    // Change from '/marketplace/users/...' to '/community/users/...'
    return api.get(`/community/reviews/?target_user=${userId}`);
  },

  // Convenience: create/update/delete reviews via marketplaceService
  createReview: (data) => marketplaceService.reviews.create(data),
  updateReview: (id, data) => marketplaceService.reviews.update(id, data),
  deleteReview: (id) => marketplaceService.reviews.delete(id),

  // Convenience wrappers for marketplace creations/updates tied to the user
  createProduct: (data) => marketplaceService.products.create(data),
  updateProduct: (id, data) => marketplaceService.products.update(id, data),
  deleteProduct: (id) => marketplaceService.products.delete(id),

  createMaterialListing: (data) =>
    marketplaceService.materialListings.create(data),
  updateMaterialListing: (id, data) =>
    marketplaceService.materialListings.update(id, data),
  deleteMaterialListing: (id) => marketplaceService.materialListings.delete(id),
};

export default userService;
