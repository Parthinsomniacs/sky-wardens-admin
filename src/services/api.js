import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sky_wardens_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn("Unauthorized / Token Expired");
    }

    return Promise.reject(error);
  }
);

// 1. AUTH API
export const authApi = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.put("/auth/change-password", data);
    return res.data;
  },
};

// 2. PRODUCTS API
export const productsApi = {
  getAllAdmin: async () => {
    const res = await api.get("/products/admin/all");
    return res.data.products;
  },
  getPublic: async (params) => {
    const res = await api.get("/products", { params });
    return res.data.products;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  },
  create: async (productData) => {
    const res = await api.post("/products", productData);
    return res.data.product;
  },
  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data.product;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`/products/${id}/status`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

// 3. DIVISIONS API
export const divisionsApi = {
  getAll: async () => {
    const res = await api.get("/divisions");
    return res.data.divisions;
  },
  create: async (divisionData) => {
    const res = await api.post("/divisions", divisionData);
    return res.data.division;
  },
  update: async (id, divisionData) => {
    const res = await api.put(`/divisions/${id}`, divisionData);
    return res.data.division;
  },
  delete: async (id) => {
    const res = await api.delete(`/divisions/${id}`);
    return res.data;
  },
};

// 3B. CATEGORIES API
export const categoriesApi = {
  getAll: async () => [],
  create: async (catData) => catData,
  update: async (id, catData) => catData,
  delete: async (id) => ({ success: true }),
};

// 4. LEADS API
export const leadsApi = {
  getAll: async (params) => {
    const res = await api.get("/leads", { params });
    return res.data.leads;
  },
  getById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return res.data.lead;
  },
  update: async (id, leadData) => {
    const res = await api.put(`/leads/${id}`, leadData);
    return res.data.lead;
  },
  updateStatus: async (id, status) => {
    const res = await api.put(`/leads/${id}`, { status });
    return res.data.lead;
  },
  delete: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
};

// 5. USERS API
export const usersApi = {
  getAll: async () => {
    const res = await api.get("/users");
    return res.data.users;
  },
  create: async (userData) => {
    const res = await api.post("/users", userData);
    return res.data.user;
  },
  update: async (id, userData) => {
    const res = await api.put(`/users/${id}`, userData);
    return res.data.user;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export default api;
