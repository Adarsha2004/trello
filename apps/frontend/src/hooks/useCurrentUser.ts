import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    retry: false,
  });
}
