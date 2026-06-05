import { create } from 'zustand';

import { AuthMiddleware, AuthService, IAuthService } from '@/shared/api/Auth.ts';
import { AuthData } from '@/app/api/zpotify';
import { UserInfo } from '@/shared/model/User.ts';
import { Errors, ServiceError } from '@/shared/api/Errors.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';
import UserService from '@/shared/api/User.ts';
import { ISongsService, SongsService } from '@/shared/api/Songs.ts';
import { ISettingsService, SettingsService } from '@/shared/api/HomePage.ts';
import { IPlaylistService, PlaylistService } from '@/shared/api/PlaylistService.ts';
import { IFileService, FileService } from '@/shared/api/FileService.ts';
import { ArtistsService, IArtistsService } from '@/shared/api/ArtistsService.ts';
import { WebApi, WebApiImpl } from '@/shared/api/WebApi.ts';

export interface Services {
    Songs(): ISongsService;
    Playlist(): IPlaylistService;
    File(): IFileService;
    Settings(): ISettingsService;
    Auth(): IAuthService;
    Artists(): IArtistsService;
    WebApi(): WebApi;
}

export interface User {
    auth: AuthMiddleware;
    userData?: UserInfo;
    earlyAccessDenied: boolean;

    Services: () => Services;

    fetchUserData: () => Promise<void>;
    authenticate: (session: AuthData) => void;
    logout: () => void;
    setUserData: (user: UserInfo) => void;
}

const useUser = create<User>((set, get) => {
    const auth = new AuthMiddleware();
    const userSvc = new UserService(auth);
    const songs = new SongsService(auth);
    const settings = new SettingsService(auth);
    const playlist = new PlaylistService(auth);
    const file = new FileService(auth);
    const authSvc = new AuthService(auth);
    const artists = new ArtistsService(auth);
    const webApi = new WebApiImpl(auth);

    return {
        auth,
        userData: undefined,
        earlyAccessDenied: false,

        Services: () => ({
            Songs: () => songs,
            Settings: () => settings,
            Playlist: () => playlist,
            File: () => file,
            Auth: () => authSvc,
            Artists: () => artists,
            WebApi: () => webApi,
        }),

        fetchUserData: async () => {
            try {
                const userData = await userSvc.GetMe();
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
