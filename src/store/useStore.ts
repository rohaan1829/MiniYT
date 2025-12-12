import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface AppState {
    user: User | null;
    sidebarOpen: boolean;
    dockVisible: boolean;
    login: (user: User) => void;
    logout: () => void;
    toggleSidebar: () => void;
    toggleDock: () => void;
}

export const useStore = create<AppState>((set) => ({
    user: null, // Mock initial state: not logged in
    sidebarOpen: true,
    dockVisible: false,
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleDock: () => set((state) => ({ dockVisible: !state.dockVisible })),
}));
