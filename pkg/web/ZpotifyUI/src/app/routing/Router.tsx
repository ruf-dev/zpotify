import cls from "@/app/routing/Router.module.css"

import {Navigate, Route, Routes} from "react-router-dom";

import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

import useAudioPlayer from "@/hooks/player/player.ts";
import HomePage from "@/pages/home/HomePage.tsx";
import useUser from "@/hooks/user/User.ts";
import Coloring from "@/admin-components/coloring/Coloring.tsx";
import Toaster from "@/components/notifications/Toaster.tsx";
import TestingPage from "@/pages/TestingPage/TestingPage.tsx";

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
                        path={'test'}
                        element={<TestingPage
                            audioPlayer={audioPlayer}
                            user={user}
                        />}
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
        </div>
    )
}
