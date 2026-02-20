import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: (data) =>
        set({
          user: data.user,
          token: data.jwtoken,
          isLoggedIn: true,
        }),

      register: (data) =>
        set({
          user: data.user,
          token: data.jwtoken,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
        }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
