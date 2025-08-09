import {Navigate, Route, Routes} from "react-router-dom";

import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

import useAudioPlayer from "@/processes/player/player.ts";
import HomePage from "@/pages/home/HomePage.tsx";
import useUser from "@/processes/user/user.ts";

export enum Path {
    HomePage = "/",
    IntiPage = "/init"
}

export default function Router() {
    const audioPlayer = useAudioPlayer();
    const user = useUser();

    return (
        <Routes>
            <Route
                path={Path.IntiPage}
                element={<InitPage AudioPlayer={audioPlayer}/>}
                errorElement={<ErrorPage/>}
            />

            <Route
                path={Path.HomePage}
                element={<HomePage
                    audioPlayer={audioPlayer}
                    user={user.username ? user : undefined}/>}
                errorElement={<ErrorPage/>}
            />

            <Route
                path={"*"}
                element={<Navigate to={"/"} replace/>}
                errorElement={<ErrorPage/>}
            />

        </Routes>
    )
}
