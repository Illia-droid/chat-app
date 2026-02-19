import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export const useUserProfile = (id) => {
  return useQuery({
    queryKey: ["user", id], 
    queryFn: () => api.get(`/user/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};
