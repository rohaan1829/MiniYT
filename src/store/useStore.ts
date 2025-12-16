import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video } from '@/data/mockData';

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface AppState {
    user: User | null;
    sidebarOpen: boolean;
    dockVisible: boolean;
    cinematicMode: boolean;
    history: Video[];
    library: Video[];
    login: (user: User) => void;
    logout: () => void;
    toggleSidebar: () => void;
    toggleDock: () => void;
    toggleCinematicMode: () => void;
    setCinematicMode: (value: boolean) => void;
    addToHistory: (video: Video) => void;
    addToLibrary: (video: Video) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            sidebarOpen: true,
            dockVisible: false,
            cinematicMode: false,
            history: [],
            library: [],
            login: (user) => set({ user }),
            logout: () => set({ user: null }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            toggleDock: () => set((state) => ({ dockVisible: !state.dockVisible })),
            toggleCinematicMode: () => set((state) => ({ cinematicMode: !state.cinematicMode })),
            setCinematicMode: (value) => set({ cinematicMode: value }),
            addToHistory: (video) => set((state) => {
                const filtered = state.history.filter((v) => v.id !== video.id);
                return { history: [video, ...filtered].slice(0, 50) };
            }),
            addToLibrary: (video) => set((state) => {
                const exists = state.library.some((v) => v.id === video.id);
                if (exists) {
                    return { library: state.library.filter((v) => v.id !== video.id) };
                }
                return { library: [video, ...state.library] };
            }),
        }),
        {
            name: 'miniyt-storage',
            partialize: (state) => ({
                user: state.user,
                history: state.history,
                library: state.library,
                cinematicMode: state.cinematicMode,
                // UI states like sidebarOpen/dockVisible are ephemeral per session/page usually
            }),
        }
    )
);

