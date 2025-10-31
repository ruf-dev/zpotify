import {useEffect, useRef, useState} from "react";

import {Session, UserInfo} from "@/model/User.ts";

import UserService from "@/processes/User.ts";
import {ISongsService, SongsService} from "@/processes/Songs.ts";
import {AuthMiddleware} from "@/processes/Auth.ts";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";

export interface User {
    userData?: UserInfo
    setUserData: (user: UserInfo) => void;

    session?: Session
    authenticate: (newSession: Session) => void;

    Services(): Services

    logout: () => void
}

export interface Services {
    Songs(): ISongsService
}

export default function useUser(): User {
    const [userData, setUserData] = useState<UserInfo>();

    const toaster = useToaster();

    const authMiddleware = useRef(new AuthMiddleware());
    const songService = useRef(new SongsService(authMiddleware));
    const userService = useRef(new UserService(authMiddleware))

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

    function authenticate(s: Session) {
        authMiddleware.current.login(s)
        fetchUserData()
    }

    function logout() {
        authMiddleware.current.logout()
        setUserData(undefined)
    }

    return {
        userData,
        setUserData,

        authenticate,
        logout,

        Services:
            () => {
                return {
                    Songs(): ISongsService {
                        return songService.current
                    },
                }
            },
    }
}
