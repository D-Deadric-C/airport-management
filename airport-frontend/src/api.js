import axios from "axios";

const API_BASE = "https://airport-management-qjgg.onrender.com/api";

export const api = {
  API_BASE,

  // ---------- AUTH ----------
  login: (email, password) =>
    axios.post(`${API_BASE}/login`, { email, password }).then((r) => r.data),

  requestOtp: (phone) =>
    axios
      .post(`${API_BASE}/request-otp`, { phone })
      .then((r) => r.data),

  register: (payload) =>
    axios.post(`${API_BASE}/register`, payload).then((r) => r.data),

  changePassword: ({ user_id, old_password, new_password }) =>
    axios
      .post(`${API_BASE}/change-password`, {
        user_id,
        old_password,
        new_password,
      })
      .then((r) => r.data),

  // ---------- PROFILE ----------
  getUser: (id) =>
    axios.get(`${API_BASE}/users/${id}`).then((r) => r.data),

  updateUser: (id, payload) =>
    axios.put(`${API_BASE}/users/${id}`, payload).then((r) => r.data),

  // ---------- AIRPORTS ----------
  getAirports: () =>
    axios.get(`${API_BASE}/airports`).then((r) => r.data),

  // ---------- FLIGHTS ----------
  getFlights: () =>
    axios.get(`${API_BASE}/flights`).then((r) => r.data),

  createFlight: (flight) =>
    axios.post(`${API_BASE}/flights`, flight).then((r) => r.data),

  updateFlight: (flightId, update) =>
    axios.put(`${API_BASE}/flights/${flightId}`, update).then((r) => r.data),

  deleteFlight: (flightId) =>
    axios.delete(`${API_BASE}/flights/${flightId}`).then((r) => r.data),

  // ---------- BOOKINGS ----------
  bookFlight: (booking) =>
    axios.post(`${API_BASE}/bookings`, booking).then((r) => r.data),

  myBookings: (userId) =>
    axios.get(`${API_BASE}/bookings/user/${userId}`).then((r) => r.data),

  // ---------- FEEDBACK ----------
  sendFeedback: (fb) =>
    axios.post(`${API_BASE}/feedback`, fb).then((r) => r.data),

  listFeedback: () =>
    axios.get(`${API_BASE}/feedback`).then((r) => r.data),

  myFeedback: (userId) =>
    axios.get(`${API_BASE}/feedback/user/${userId}`).then((r) => r.data),

  // ---------- BAGGAGE ----------
  createBaggage: (bag) =>
    axios.post(`${API_BASE}/baggage`, bag).then((r) => r.data),

  searchBaggage: (tag) =>
    axios.get(`${API_BASE}/baggage/${tag}`).then((r) => r.data),

  // ---------- ADMIN ----------
  getAdminSummary: () =>
    axios.get(`${API_BASE}/admin/summary`).then((r) => r.data),

  importEmployees: (path) =>
    axios
      .post(`${API_BASE}/admin/import-employees`, { path })
      .then((r) => r.data),

  feedbackCsvUrl: `${API_BASE}/admin/feedback-export`,
};
