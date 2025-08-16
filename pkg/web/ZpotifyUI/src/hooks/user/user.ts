import {useEffect, useState} from "react";
import {AuthData, UserInfo} from "@/model/user.ts";
import {GetMe} from "@/processes/user.ts";

export interface User {
    userData?: UserInfo
    setUserdata: (user: UserInfo) => void;

    authData?: AuthData
    authenticate: (authData: AuthData) => void;
}

export default function useUser(): User {
    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [authData, setAuthData] =
        useState<AuthData>();

    useEffect(() => {
        setAuthData(fromLocalStorage())
    }, []);

    if (authData) fetchUserData(authData)

    function authenticate(authData: AuthData) {
        setAuthData(authData);
        toLocalStorage(authData);
    }

    function fetchUserData(authData: AuthData) {
        GetMe(authData)
            .then((userInf) => {setUserInfo(userInf)})
    }

    return {
        userData: userInfo,
        setUserdata: setUserInfo,

        authData,
        authenticate,
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

function getLocalStorageAuthInfoKey(): string {
    return "user_auth_info"
}
