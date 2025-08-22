import {useEffect, useState} from "react";
import {AuthData, UserInfo} from "@/model/user.ts";
import UserService from "@/processes/user.ts";
import {ErrorCodes} from "@/processes/ErrorCodes.ts";

export interface User {
    userData?: UserInfo
    setUserData: (user: UserInfo) => void;

    authData?: AuthData
    authenticate: (authData: AuthData) => void;
    logout: () => void
}

export default function useUser(): User {
    const [userData, setUserData] = useState<UserInfo>();

    const [authData, setAuthData] =
        useState<AuthData>();

    useEffect(() => {
        const authD = fromLocalStorage()
        setAuthData(authD)

        if (authD) {
            fetchUserData(authD)
        }
    }, []);


    function authenticate(authData: AuthData) {
        setAuthData(authData);
        toLocalStorage(authData);

        fetchUserData(authData)
    }

    function logout() {
        setAuthData(undefined)
        setUserData(undefined)
        clearLocalStorage()
    }

    function fetchUserData(authData: AuthData) {
        const s = new UserService(authData)
        s.GetMe()
            .then((userInf) => {
                setUserData(userInf)
            })
            .catch(async (err) => {
                if (!err.code) {
                    logout()
                }

                if (err.code == ErrorCodes.UNAUTHENTICATED) {
                    s.RefreshToken().then((ad) => {
                        setAuthData(ad);
                    }).catch((err) => {
                        if (err.code == ErrorCodes.UNAUTHENTICATED) {
                            logout()
                        }
                    })
                }
            })
    }

    return {
        userData,
        setUserData,

        authData,
        authenticate,
        logout
    }
}


function toLocalStorage(authData: AuthData) {
    localStorage.setItem(getLocalStorageAuthInfoKey(), JSON.stringify(authData))
}

function fromLocalStorage(): AuthData | undefined {
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
    return "user_auth_info"
}
