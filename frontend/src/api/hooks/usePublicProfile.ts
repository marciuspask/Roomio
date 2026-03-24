import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () =>
      apiClient
        .getPublicProfileApiV1UsersUserIdProfileGet(userId)
        .then((res) => res.data),
    enabled: !!userId,
  });
}
