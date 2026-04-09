import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set('tl_access_token', accessToken, { expires: 7 });
        Cookies.set('tl_refresh_token', refreshToken, { expires: 30 });
        localStorage.setItem('tl_access_token', accessToken);
        localStorage.setItem('tl_refresh_token', refreshToken);
        set({ user, accessToken });
      },
      logout: () => {
        Cookies.remove('tl_access_token');
        Cookies.remove('tl_refresh_token');
        localStorage.removeItem('tl_access_token');
        localStorage.removeItem('tl_refresh_token');
        set({ user: null, accessToken: null });
      },
      isAuthenticated: () => !!get().user && !!get().accessToken,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'trulance-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); },
    }
  )
);
