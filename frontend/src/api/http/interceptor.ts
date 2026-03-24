import { apiClient } from "../client";
import { getAuthToken } from "./auth";

apiClient.instance.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
