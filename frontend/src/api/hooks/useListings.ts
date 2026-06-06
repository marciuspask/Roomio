import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useListings(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["listings", limit, offset],
    queryFn: () =>
      apiClient
        .getAllListingsApiV1ListingsGet({ limit, offset })
        .then((res) => res.data),
  });
}
