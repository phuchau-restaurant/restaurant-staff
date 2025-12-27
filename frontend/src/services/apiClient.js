import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "x-tenant-id": import.meta.env.VITE_TENANT_ID,
  },
});

export default apiClient;
