import cls from "@/app/routing/Router.module.css"

import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {useEffect} from "react";

import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";
import PlaylistPage from "@/pages/playlist/PlaylistPage.tsx";
import EarlyAccessPage from "@/pages/early_access/EarlyAccessPage.tsx";

import useAudioPlayer from "@/widgets/MusicPlayer/usePlayer.ts";
import useUser from "@/entities/user/useUser.ts";
import Toaster from "@/components/notifications/Toaster.tsx";


import HomePage from "@/pages/home/HomePage.tsx";
import Coloring from "@/admin-components/coloring/Coloring.tsx";

import {Tooltip} from "react-tooltip";
import Dialog from "@/pages/segments/Dialog.tsx";

export enum Path {
    HomePage = "/",
    IntiPage = "/init",
    PlaylistPage = "/playlist/:id",
    EarlyAccessPage = "/early_access",
}

export function playlistPath(id: string): string {
    return `/playlist/${id}`;
}

export default function Router() {
    const audioPlayer = useAudioPlayer();
    const navigate = useNavigate();

    const earlyAccessDenied = useUser(state => state.earlyAccessDenied);
    const auth = useUser(state => state.auth);
    const fetchUserData = useUser(state => state.fetchUserData);

    useEffect(() => {
        if (auth.session) {
            void fetchUserData();
        }
    }, []);

    useEffect(() => {
        if (earlyAccessDenied) {
            navigate(Path.EarlyAccessPage);
        }
    }, [earlyAccessDenied]);

    return (
        <div className={cls.Root}>
            <div className={cls.Content}>
                <Routes>
                    <Route
                        path={Path.IntiPage}
                        element={<InitPage AudioPlayer={audioPlayer}/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={Path.HomePage}
                        element={<HomePage audioPlayer={audioPlayer}/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={Path.PlaylistPage}
                        element={<PlaylistPage audioPlayer={audioPlayer}/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={Path.EarlyAccessPage}
                        element={<EarlyAccessPage/>}
                        errorElement={<ErrorPage/>}
                    />

                    <Route
                        path={"*"}
                        element={<Navigate to={"/"} replace/>}
                        errorElement={<ErrorPage/>}
                    />

                </Routes>


                <Dialog/>
                <Tooltip
                    id="root-tooltip"
                    variant={"light"}
                />
                <Toaster/>
            </div>

            <div className={cls.Admins}>
                <Coloring/>
            </div>
        </div>
    )
}
