import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; 
  return `${BASE_URL}${path}`;
};

export default api;