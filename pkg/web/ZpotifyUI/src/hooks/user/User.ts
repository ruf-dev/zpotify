import {useEffect, useRef, useState} from "react";

import {Session, UserInfo} from "@/model/User.ts";

import UserService from "@/processes/User.ts";
import {ISongsService, SongsService} from "@/processes/Songs.ts";
import {AuthMiddleware} from "@/processes/Auth.ts";

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
    const [session, setSession] = useState<Session>();

    const authMiddleware = useRef(new AuthMiddleware());
    const songService = useRef(new SongsService(authMiddleware));
    const userService = useRef(new UserService(authMiddleware))

    useEffect(() => {
        const sessionFromLocal = fromLocalStorage()
        setSession(sessionFromLocal)

        if (sessionFromLocal) {
            console.log(sessionFromLocal)
            authMiddleware.current.session = sessionFromLocal
            fetchUserData()
        }
    }, []);

    function authenticate(newSession: Session) {
        setSession(newSession);
        saveToLocalStorage(newSession);
        authMiddleware.current.session = newSession

        fetchUserData()
    }

    function logout() {
        setSession(undefined)
        setUserData(undefined)
        clearLocalStorage()
        authMiddleware.current.session = undefined
    }

    function fetchUserData() {
        userService.current
            .GetMe()
            .then(setUserData)
    }

    return {
        userData,
        setUserData,

        session,
        authenticate,

        Services: () => {
            return {
                Songs(): ISongsService {
                    return songService.current
                },
            }
        },

        logout,
    }
}


function saveToLocalStorage(session: Session) {
    localStorage.setItem(getLocalStorageAuthInfoKey(), JSON.stringify(session))
}

function fromLocalStorage(): Session | undefined {
    const authInfoFromLocalStorage = localStorage.getItem(getLocalStorageAuthInfoKey())
    if (!authInfoFromLocalStorage) {
        return
    }

    return JSON.parse(authInfoFromLocalStorage)
}

function clearLocalStorage() {
    localStorage.removeItem(getLocalStorageAuthInfoKey())
}

function getLocalStorageAuthInfoKey(): string {
    return "user_session"
}
