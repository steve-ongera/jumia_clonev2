import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh access token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  me: () => api.get("/auth/me/"),
  updateMe: (data) => api.patch("/auth/me/", data),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  list: () => api.get("/categories/"),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  list: (params = {}) => api.get("/products/", { params }),
  detail: (slug) => api.get(`/products/${slug}/`),
  flashSale: () => api.get("/products/flash-sale/"),
  addReview: (slug, data) => api.post(`/products/${slug}/reviews/`, data),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get("/cart/"),
  add: (productId, quantity = 1) =>
    api.post("/cart/add/", { product_id: productId, quantity }),
  update: (itemId, quantity) =>
    api.patch(`/cart/item/${itemId}/`, { quantity }),
  remove: (itemId) => api.delete(`/cart/item/${itemId}/`),
  clear: () => api.delete("/cart/"),
};

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addressAPI = {
  list: () => api.get("/addresses/"),
  create: (data) => api.post("/addresses/", data),
  update: (id, data) => api.patch(`/addresses/${id}/`, data),
  delete: (id) => api.delete(`/addresses/${id}/`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  list: () => api.get("/orders/"),
  detail: (id) => api.get(`/orders/${id}/`),
  place: (data) => api.post("/orders/place/", data),
};

// ─── M-Pesa ───────────────────────────────────────────────────────────────────
export const mpesaAPI = {
  stkPush: (orderId, phoneNumber) =>
    api.post("/mpesa/stk-push/", { order_id: orderId, phone_number: phoneNumber }),
  status: (checkoutRequestId) =>
    api.get(`/mpesa/status/${checkoutRequestId}/`),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatPrice = (amount) =>
  `KES ${Number(amount).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;

export const getErrorMessage = (error) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const msg = data[firstKey];
      return Array.isArray(msg) ? `${firstKey}: ${msg[0]}` : String(msg);
    }
  }
  return "Something went wrong. Please try again.";
};

export default api;