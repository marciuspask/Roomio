import { Api } from "./generated/Api";

export const apiClient = new Api({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000",
});
