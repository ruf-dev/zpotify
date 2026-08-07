import { create } from 'zustand';

import { AuthMiddleware, setOnSessionInvalidated } from '@/shared/api/Auth.ts';
import { setAuthMiddleware } from '@/shared/api/BaseService.ts';
import type { AuthData } from '@/app/api/zpotify';
import { UserInfo } from '@/shared/model/User.ts';
import { Errors, ServiceError, WithTitle } from '@/shared/api/Errors.ts';
import { catchServiceError } from '@/shared/lib/toaster/ToasterZ.ts';
import { userService } from '@/shared/api/User.ts';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface User {
    auth: AuthMiddleware;
    userData?: UserInfo;
    earlyAccessDenied: boolean;
    authStatus: AuthStatus;

    fetchUserData: () => Promise<void>;
    authenticate: (session: AuthData) => void;
    logout: () => void;
    setUserData: (user: UserInfo) => void;
}

const useUser = create<User>((set, get) => {
    const auth = new AuthMiddleware();
    setAuthMiddleware(auth);
    setOnSessionInvalidated(() => {
        if (get().authStatus === 'unauthenticated') return;
        get().logout();
        catchServiceError(new ServiceError(WithTitle('Session expired. Please log in again.')));
    });

    return {
        auth,
        userData: undefined,
        earlyAccessDenied: false,
        authStatus: auth.session ? 'checking' : 'unauthenticated',

        fetchUserData: async () => {
            try {
                const userData = await userService.GetMe();
                set({ userData, authStatus: 'authenticated' });
            } catch (err: unknown) {
                if (err instanceof ServiceError && err.code === Errors.UNAVAILABLE) {
                    set({ earlyAccessDenied: true, authStatus: 'authenticated' });
                    return;
                }
                set({ authStatus: 'unauthenticated', userData: undefined });
                catchServiceError(err as ServiceError);
            }
        },

        authenticate: (session: AuthData) => {
            auth.login(session);
            set({ auth });
            void get().fetchUserData();
        },

        logout: () => {
            auth.logout();
            set({ userData: undefined, earlyAccessDenied: false, authStatus: 'unauthenticated' });
        },

        setUserData: (user: UserInfo) => set({ userData: user }),
    };
});

export default useUser;
