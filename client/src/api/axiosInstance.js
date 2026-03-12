import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
});

export const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; 
  return `${BASE_URL}${path}`;
};

export default api;