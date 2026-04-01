import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiClient } from "@/api/client";

export function useSavedListings() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["saved-listings"],
    queryFn: () =>
      apiClient.getSavedListingsApiV1SavedGet().then((res) => res.data),
    enabled: !!isSignedIn,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiClient.saveListingApiV1SavedListingIdPost(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiClient.unsaveListingApiV1SavedListingIdDelete(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
    },
  });
}
