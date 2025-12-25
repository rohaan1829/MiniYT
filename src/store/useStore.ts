import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
    bio?: string;
    avatar?: string;
    image?: string;
    settings?: any;
    twoFactorEnabled?: boolean;
    channel?: Channel | null;
}

interface AppState {
    // Auth state
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    rememberMe: boolean;
    sessions: any[];

    // UI state
    sidebarOpen: boolean;
    dockVisible: boolean;
    cinematicMode: boolean;
    history: Video[];
    library: Video[];
    isUploading: boolean;
    uploadDialogOpen: boolean;

    // Auth actions
    setAuth: (user: User, token: string, rememberMe?: boolean) => void;
    clearAuth: () => void;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
    updateProfile: (data: { name?: string; email?: string; bio?: string; settings?: any }) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    changePassword: (data: any) => Promise<void>;
    toggle2FA: (enabled: boolean) => Promise<void>;
    fetchSessions: () => Promise<void>;
    revokeSession: (sessionId: string) => Promise<void>;

    // Channel actions
    createChannel: (data: CreateChannelData) => Promise<void>;
    updateChannel: (channelId: string, data: any) => Promise<void>;
    uploadChannelAvatar: (channelId: string, file: File) => Promise<void>;
    uploadChannelBanner: (channelId: string, file: File) => Promise<void>;
    updateUserChannel: (channel: Channel) => void;
    subscribe: (channelId: string) => Promise<void>;
    unsubscribe: (channelId: string) => Promise<void>;

    // UI actions
    toggleSidebar: () => void;
    toggleDock: () => void;
    toggleCinematicMode: () => void;
    setCinematicMode: (value: boolean) => void;
    addToHistory: (video: Video) => void;
    addToLibrary: (video: Video) => void;
    setIsUploading: (value: boolean) => void;
    setUploadDialogOpen: (value: boolean) => void;
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
            rememberMe: false,

            // UI state
            sidebarOpen: true,
            dockVisible: false,
            cinematicMode: false,
            history: [],
            library: [],
            sessions: [],
            isUploading: false,
            uploadDialogOpen: false,

            // Auth actions
            setAuth: (user, token, rememberMe = false) => {
                if (rememberMe) {
                    localStorage.setItem('auth_token', token);
                    sessionStorage.removeItem('auth_token');
                } else {
                    sessionStorage.setItem('auth_token', token);
                    localStorage.removeItem('auth_token');
                }
                set({ user, token, isAuthenticated: true, error: null, rememberMe });
            },

            clearAuth: () => {
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            login: async (email, password, rememberMe = false) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login({ email, password });
                    get().setAuth(response.data.user, response.data.token, rememberMe);
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

            changePassword: async (data: any) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.changePassword(data);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Password change failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            toggle2FA: async (enabled: boolean) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.toggle2FA(enabled);
                    const currentUser = get().user;
                    if (currentUser) {
                        set({
                            user: {
                                ...currentUser,
                                twoFactorEnabled: response.data.twoFactorEnabled,
                            },
                        });
                    }
                } catch (error: any) {
                    const message = error.response?.data?.message || '2FA toggle failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            fetchSessions: async () => {
                try {
                    const response = await authApi.getSessions();
                    set({ sessions: response.data });
                } catch (error: any) {
                    console.error('Failed to fetch sessions:', error);
                }
            },

            revokeSession: async (sessionId: string) => {
                try {
                    await authApi.revokeSession(sessionId);
                    set((state) => ({
                        sessions: state.sessions.filter((s: any) => s.id !== sessionId),
                    }));
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Failed to revoke session';
                    set({ error: message });
                    throw error;
                }
            },

            updateChannel: async (channelId, data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await channelApi.update(channelId, data);
                    const currentUser = get().user;
                    if (currentUser && currentUser.channel?.id === channelId) {
                        set({
                            user: {
                                ...currentUser,
                                channel: response.data,
                            },
                        });
                    }
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Channel update failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            uploadChannelAvatar: async (channelId, file) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await channelApi.uploadAvatar(channelId, file);
                    const currentUser = get().user;
                    if (currentUser && currentUser.channel?.id === channelId) {
                        set({
                            user: {
                                ...currentUser,
                                channel: response.data,
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

            uploadChannelBanner: async (channelId, file) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await channelApi.uploadBanner(channelId, file);
                    const currentUser = get().user;
                    if (currentUser && currentUser.channel?.id === channelId) {
                        set({
                            user: {
                                ...currentUser,
                                channel: response.data,
                            },
                        });
                    }
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Banner upload failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            subscribe: async (channelId) => {
                try {
                    await channelApi.subscribe(channelId);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Subscription failed';
                    set({ error: message });
                    throw error;
                }
            },

            unsubscribe: async (channelId) => {
                try {
                    await channelApi.unsubscribe(channelId);
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Unsubscribe failed';
                    set({ error: message });
                    throw error;
                }
            },

            createChannel: async (data: CreateChannelData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await channelApi.create(data);
                    const currentUser = get().user;
                    if (currentUser) {
                        set({
                            user: {
                                ...currentUser,
                                channel: response.data,
                            },
                        });
                    }
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
            setIsUploading: (value: boolean) => set({ isUploading: value }),
            setUploadDialogOpen: (value: boolean) => set({ uploadDialogOpen: value }),
        }),
        {
            name: 'miniyt-storage',
            storage: createJSONStorage(() => ({
                getItem: (name) => {
                    const local = localStorage.getItem(name);
                    const session = sessionStorage.getItem(name);
                    return local || session;
                },
                setItem: (name, value) => {
                    const parsed = JSON.parse(value);
                    if (parsed.state.rememberMe) {
                        localStorage.setItem(name, value);
                        sessionStorage.removeItem(name);
                    } else {
                        sessionStorage.setItem(name, value);
                        localStorage.removeItem(name);
                    }
                },
                removeItem: (name) => {
                    localStorage.removeItem(name);
                    sessionStorage.removeItem(name);
                },
            })),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                rememberMe: state.rememberMe,
                history: state.history,
                library: state.library,
                cinematicMode: state.cinematicMode,
            }),
        }
    )
);

