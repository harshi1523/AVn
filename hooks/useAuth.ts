import { useStore } from '../lib/store';

export const useAuth = () => {
  const { user, login, logout, signup, isDBReady } = useStore();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !isDBReady,
    login,
    logout,
    signup,
  };
};