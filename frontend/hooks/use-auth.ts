"use client";

import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export const useAuth = () => {
  const currentUser = useBidWiseStore((state) => state.currentUser);
  const login = useBidWiseStore((state) => state.login);
  const logout = useBidWiseStore((state) => state.logout);
  const register = useBidWiseStore((state) => state.register);

  return {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated: Boolean(currentUser)
  };
};
