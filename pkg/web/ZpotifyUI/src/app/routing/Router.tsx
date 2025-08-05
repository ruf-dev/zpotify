import {Navigate, Route, Routes} from "react-router-dom";

import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

import useAudioPlayer from "@/processes/player/player.ts";
import HomePage from "@/pages/home/HomePage.tsx";

export enum Path {
    HomePage = "/",
    IntiPage = "/init"
}

export default function Router() {
    const audioPlayer = useAudioPlayer()

    return (
        <Routes>
            <Route
                path={Path.IntiPage}
                element={<InitPage AudioPlayer={audioPlayer}/>}
                errorElement={<ErrorPage/>}
            />

            <Route
                path={Path.HomePage}
                element={<HomePage AudioPlayer={audioPlayer}/>}
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
