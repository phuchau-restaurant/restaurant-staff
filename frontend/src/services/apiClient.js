import axios from "axios";
import { getTenantId } from "../utils/auth";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add tenant ID to each request dynamically
apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }
  return config;
});

export default apiClient;
