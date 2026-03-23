import axios from "axios";

const resolveApiBaseUrl = () => {
  const rawUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000/api";

  const normalized = rawUrl.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
});

export default API;