import { useQuery } from "@tanstack/react-query";

type AdminStatus = {
    isAdmin: boolean;
};

export function useAdmin() {
    const { data = { isAdmin: false }, isLoading } = useQuery<AdminStatus>({
        queryKey: ["/api/admin/status"],
        retry: false,
    });

    return {
        isAdmin: data.isAdmin || false,
        isLoading,
    };
}
