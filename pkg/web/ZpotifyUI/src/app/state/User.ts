import {create} from 'zustand';
import {AuthData} from "@/model/User.ts";

interface AuthState {
    authData: AuthData | null;
    setAuthData: (authData: AuthData | null) => void;
}

export const useAuthStore = create<AuthState>()(
    (set) => ({
        authData: null,
        setAuthData: (token: AuthData | null) => set({authData: token}),
    }));
