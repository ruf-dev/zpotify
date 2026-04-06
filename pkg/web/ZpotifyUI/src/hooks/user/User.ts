import {useEffect, useRef, useState} from "react";

import {UserInfo} from "@/model/User.ts";

import UserService from "@/processes/User.ts";
import {ISongsService, SongsService} from "@/processes/Songs.ts";

import {AuthService, IAuthService, AuthMiddleware} from "@/processes/Auth.ts";

import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import {ISettingsService, SettingsService} from "@/processes/HomePage.ts";
import {IPlaylistService, PlaylistService} from "@/processes/PlaylistService.ts";
import {AuthData} from "@/app/api/zpotify/zpotify_auth_service.pb.ts";

// Todo redo onto UserContext
export interface User {
    userData?: UserInfo
    setUserData: (user: UserInfo) => void;

    session?: AuthData

    Authenticate(newSession: AuthData): void;

    Logout(): void

    Services(): Services
}

export interface Services {
    Songs(): ISongsService

    Playlist(): IPlaylistService

    Settings(): ISettingsService

    Auth(): IAuthService
}

//  TODO TOTALY REDO
export default function useUser(): User {
    const [userData, setUserData] = useState<UserInfo>();

    const toaster = useToaster();

    const authMiddleware = useRef(new AuthMiddleware());
    const songService = useRef(new SongsService(authMiddleware));
    const userService = useRef(new UserService(authMiddleware))
    const settingsService = useRef(new SettingsService(authMiddleware))
    const playlistService = useRef(new PlaylistService(authMiddleware))
    const authService = useRef(new AuthService(authMiddleware))

    useEffect(() => {
        if (authMiddleware.current.session) {
            fetchUserData()
        }
    }, [authMiddleware]);


    function fetchUserData() {
        userService.current
            .GetMe()
            .then(setUserData)
            .catch(toaster.catch)
    }

    function Authenticate(s: AuthData) {
        authMiddleware.current.login(s)
        fetchUserData()
    }

    function Logout() {
        authMiddleware.current.logout()
        setUserData(undefined)
    }

    return {
        userData,
        setUserData,

        Authenticate,
        Logout,

        Services:
            () => {
                return {
                    Songs(): ISongsService {
                        return songService.current
                    },
                    Settings(): ISettingsService {
                        return settingsService.current
                    },
                    Playlist(): IPlaylistService {
                        return playlistService.current
                    },
                    Auth(): IAuthService {
                        return authService.current
                    }
                }
            },
    }
}
