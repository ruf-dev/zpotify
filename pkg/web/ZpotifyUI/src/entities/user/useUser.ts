import { create } from 'zustand';

import { AuthMiddleware } from '@/shared/api/Auth.ts';
import { setAuthMiddleware } from '@/shared/api/BaseService.ts';
import type { AuthData } from '@/app/api/zpotify';
import { UserInfo } from '@/shared/model/User.ts';
import { Errors, ServiceError } from '@/shared/api/Errors.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { userService } from '@/shared/api/User.ts';

export interface User {
    auth: AuthMiddleware;
    userData?: UserInfo;
    earlyAccessDenied: boolean;

    fetchUserData: () => Promise<void>;
    authenticate: (session: AuthData) => void;
    logout: () => void;
    setUserData: (user: UserInfo) => void;
}

const useUser = create<User>((set, get) => {
    const auth = new AuthMiddleware();
    setAuthMiddleware(auth);

    return {
        auth,
        userData: undefined,
        earlyAccessDenied: false,

        fetchUserData: async () => {
            try {
                const userData = await userService.GetMe();
                set({ userData });
            } catch (err: unknown) {
                if (err instanceof ServiceError && err.code === Errors.UNAVAILABLE) {
                    set({ earlyAccessDenied: true });
                    return;
                }
                useToaster.getState().catch(err as ServiceError);
            }
        },

        authenticate: (session: AuthData) => {
            auth.login(session);
            set({ auth });
            void get().fetchUserData();
        },

        logout: () => {
            auth.logout();
            set({ userData: undefined, earlyAccessDenied: false });
        },

        setUserData: (user: UserInfo) => set({ userData: user }),
    };
});

export default useUser;
