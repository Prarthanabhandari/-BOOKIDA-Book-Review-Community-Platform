import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("bookida_user") || "null");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data).then(r => r.data),
  login:    (data) => api.post("/auth/login",    data).then(r => r.data),
  getMe:    ()     => api.get("/auth/me").then(r => r.data),
};

export const reviewsAPI = {
  getAll:          (page=1, limit=5, category="") =>
    api.get(`/reviews?page=${page}&limit=${limit}&category=${category}`).then(r => r.data),
  getRecent:       () => api.get("/reviews/recent").then(r => r.data),
  getFeatured:     () => api.get("/reviews/featured").then(r => r.data),
  getTopReviewers: () => api.get("/reviews/top-reviewers").then(r => r.data),
  getArchives:     () => api.get("/reviews/archives").then(r => r.data),
  getStats:        () => api.get("/reviews/stats").then(r => r.data),
  getById:         (id)      => api.get(`/reviews/${id}`).then(r => r.data),
  search:          (q)       => api.get(`/reviews/search?q=${encodeURIComponent(q)}`).then(r => r.data),
  create:          (data)    => api.post("/reviews", data).then(r => r.data),
  update:          (id,data) => api.put(`/reviews/${id}`, data).then(r => r.data),
  delete:          (id)      => api.delete(`/reviews/${id}`).then(r => r.data),
  getMyReviews:    () => api.get("/reviews/my-reviews").then(r => r.data),
  toggleFeatured:  (id) => api.put(`/reviews/${id}/feature`).then(r => r.data),
  adminGetReviews: (q="") => api.get(`/reviews/admin/reviews${q?"?q="+encodeURIComponent(q):""}`).then(r=>r.data).catch(()=>({data:[],total:0})),
adminGetUsers:   ()     => api.get("/reviews/admin/users").then(r=>r.data).catch(()=>[]),
  adminDeleteUser: (id)  => api.delete(`/reviews/admin/users/${id}`).then(r => r.data),
// Add to reviewsAPI:
submitContact:    (data) => api.post("/reviews/contact", data).then(r => r.data),
adminGetContacts: ()     => api.get("/reviews/admin/contacts").then(r => r.data).catch(()=>[]),
markContactRead:  (id)   => api.put(`/reviews/admin/contacts/${id}/read`).then(r => r.data),
};

export default api;