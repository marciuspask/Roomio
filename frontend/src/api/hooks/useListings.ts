import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: () =>
      apiClient.getAllListingsApiV1ListingsGet().then((res) => res.data),
  });
}
