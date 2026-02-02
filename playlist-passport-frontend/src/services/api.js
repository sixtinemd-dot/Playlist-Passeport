import axios from "axios";

/*
  Central Axios instance used across the frontend
  - Points to the backend API
  - Automatically attaches the JWT token to each request
*/

const API = axios.create({
  baseURL: "http://localhost:5005",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

