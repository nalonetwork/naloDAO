import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Notification, Theme } from '@/types';

interface UIState {
  theme: Theme;
  notifications: Notification[];
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  isLoading: boolean;
  loadingMessage: string;
}

interface UIActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setSidebarOpen: (open: boolean) => void;
  setModalOpen: (open: boolean, type?: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    theme: {
      mode: 'light',
      primary_color: '#22c55e',
    },
    notifications: [],
    sidebarOpen: false,
    modalOpen: false,
    modalType: null,
    isLoading: false,
    loadingMessage: '',

    // Actions
    toggleTheme: () => {
      const { theme } = get();
      const newTheme: Theme = {
        ...theme,
        mode: theme.mode === 'light' ? 'dark' : 'light',
      };
      
      set({ theme: newTheme });
      
      // Update document class
      if (newTheme.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('nalodao-theme', JSON.stringify(newTheme));
    },

    setTheme: (theme: Theme) => {
      set({ theme });
      
      // Update document class
      if (theme.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('nalodao-theme', JSON.stringify(theme));
    },

    addNotification: (notification) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        created_at: new Date().toISOString(),
      };
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));
      
      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          get().removeNotification(id);
        }, notification.duration || 5000);
      }
    },

    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },

    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
    },

    setModalOpen: (open: boolean, type?: string) => {
      set({ 
        modalOpen: open, 
        modalType: open ? type || null : null 
      });
    },

    setLoading: (loading: boolean, message: string = '') => {
      set({ isLoading: loading, loadingMessage: message });
    },
  }))
);

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('nalodao-theme');
if (savedTheme) {
  try {
    const theme: Theme = JSON.parse(savedTheme);
    useUIStore.getState().setTheme(theme);
  } catch (error) {
    console.error('Error parsing saved theme:', error);
  }
} else {
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  useUIStore.getState().setTheme({
    mode: prefersDark ? 'dark' : 'light',
    primary_color: '#22c55e',
  });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const { theme } = useUIStore.getState();
  if (!localStorage.getItem('nalodao-theme')) {
    useUIStore.getState().setTheme({
      ...theme,
      mode: e.matches ? 'dark' : 'light',
    });
  }
});