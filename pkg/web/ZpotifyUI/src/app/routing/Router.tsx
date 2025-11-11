import cls from "@/app/routing/Router.module.css"

import {Navigate, Route, Routes} from "react-router-dom";

import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

import useAudioPlayer from "@/hooks/player/player.ts";
import useUser from "@/hooks/user/User.ts";
import Toaster from "@/components/notifications/Toaster.tsx";

import HomePage from "@/pages/home/HomePage.tsx";
import Coloring from "@/admin-components/coloring/Coloring.tsx";

import {Tooltip} from "react-tooltip";

export enum Path {
    HomePage = "/",
    IntiPage = "/init"
}

export default function Router() {
    const audioPlayer = useAudioPlayer();
    const user = useUser();

    return (
        <div className={cls.Root}>
            <div className={cls.Content}>
                <Routes>
                    <Route
                        path={Path.IntiPage}
                        element={<InitPage
                            UserState={user}
                            AudioPlayer={audioPlayer}/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={Path.HomePage}
                        element={<HomePage
                            audioPlayer={audioPlayer}
                            user={user}/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={"*"}
                        element={<Navigate to={"/"} replace/>}
                        errorElement={<ErrorPage/>}
                    />

                </Routes>

                <Toaster/>
            </div>

            <div className={cls.Admins}>
                <Coloring/>
            </div>

            <Tooltip
                id="root-tooltip"
                variant={"light"}
            />
        </div>
    )
}
