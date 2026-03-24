import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.getProfileApiV1ProfileGet().then((res) => res.data),
  });
}
