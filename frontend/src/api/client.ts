import { Api } from "./generated/Api";

export const apiClient = new Api({ baseURL: "http://localhost:8000" });
