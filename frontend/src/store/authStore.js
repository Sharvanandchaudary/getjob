import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user and token
      setAuth: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },

      // Clear auth state
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      // Update user data
      updateUser: (userData) => {
        const currentUser = get().user;
        set({ 
          user: { ...currentUser, ...userData } 
        });
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
      },

      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ 
              user, 
              token, 
              isAuthenticated: true 
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
