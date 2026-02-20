import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export const useUserProfile = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => api.get(`/user/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/user/${id}`, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["user", variables.id]);
    },
  });
};
