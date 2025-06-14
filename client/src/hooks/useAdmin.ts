import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data = { isAdmin: false }, isLoading } = useQuery({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  return {
    isAdmin: data.isAdmin || false,
    isLoading,
  };
}