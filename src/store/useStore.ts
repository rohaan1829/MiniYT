import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video } from '@/data/mockData';
import { authApi, RegisterData } from '@/lib/api/auth';
import { channelApi, CreateChannelData } from '@/lib/api/channels';

interface Channel {
    id: string;
    handle: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    subscriberCount: number;
    verified: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    channel?: Channel | null;
}

interface AppState {
    // Auth state
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // UI state
    sidebarOpen: boolean;
    dockVisible: boolean;
    cinematicMode: boolean;
    history: Video[];
    library: Video[];

    // Auth actions
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
    updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;

    // Channel actions
    createChannel: (data: CreateChannelData) => Promise<void>;
    updateUserChannel: (channel: Channel) => void;

    // UI actions
    toggleSidebar: () => void;
    toggleDock: () => void;
    toggleCinematicMode: () => void;
    setCinematicMode: (value: boolean) => void;
    addToHistory: (video: Video) => void;
    addToLibrary: (video: Video) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth state
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // UI state
            sidebarOpen: true,
            dockVisible: false,
            cinematicMode: false,
            history: [],
            library: [],

            // Auth actions
            setAuth: (user, token) => {
                localStorage.setItem('auth_token', token);
                set({ user, token, isAuthenticated: true, error: null });
            },

            clearAuth: () => {
                localStorage.removeItem('auth_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login({ email, password });
                    get().setAuth(response.data.user, response.data.token);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.register(data);
                    // Registration successful, don't auto-login
                    set({ error: null });
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: () => {
                get().clearAuth();
            },

            refreshAuth: async () => {
                try {
                    const response = await authApi.refresh();
                    get().setAuth(response.data.user, response.data.token);
                } catch (error) {
                    get().clearAuth();
                }
            },

            clearError: () => set({ error: null }),

            updateProfile: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.updateProfile(data);
                    // Update user in store
                    const currentUser = get().user;
                    if (currentUser) {
                        set({
                            user: {
                                ...currentUser,
                                ...response.data,
                            },
                        });
                    }
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Profile update failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            uploadAvatar: async (file) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.uploadAvatar(file);
                    // Update user in store with new avatar URL
                    const currentUser = get().user;
                    if (currentUser) {
                        set({
                            user: {
                                ...currentUser,
                                ...response.data,
                            },
                        });
                    }
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Avatar upload failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            // Channel actions
            createChannel: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await channelApi.create(data);
                    // Update user with new channel
                    const currentUser = get().user;
                    if (currentUser) {
                        set({
                            user: {
                                ...currentUser,
                                channel: response.data,
                            },
                            error: null,
                        });
                    }
                    // Refresh to get updated token with channelId
                    await get().refreshAuth();
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Channel creation failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateUserChannel: (channel) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, channel } });
                }
            },

            // UI actions
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
                token: state.token,
                history: state.history,
                library: state.library,
                cinematicMode: state.cinematicMode,
            }),
        }
    )
);

