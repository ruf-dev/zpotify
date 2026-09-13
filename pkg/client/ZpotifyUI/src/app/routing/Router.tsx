import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { Toaster } from '@vervstack/chures';

import cls from '@/app/routing/Router.module.css';
import { Path } from '@/app/routing/paths.ts';
import InitPage from '@/pages/init/InitPage.tsx';
import ErrorPage from '@/pages/error/ErrorPage.tsx';
import PlaylistPage from '@/pages/main/playlist/PlaylistPage.tsx';
import AlbumPage from '@/pages/main/album/AlbumPage.tsx';
import ArtistPage from '@/pages/main/artist/ArtistPage.tsx';
import EarlyAccessPage from '@/pages/early_access/EarlyAccessPage.tsx';
import useUser from '@/entities/user/useUser.ts';
import HomePage from '@/pages/main/home/HomePage.tsx';
import SearchPage from '@/pages/main/search/SearchPage.tsx';
import DownloadsPage from '@/pages/downloads/DownloadsPage.tsx';
import Dialog from '@/pages/dialog/Dialog.tsx';
import MainLayout from '@/app/layouts/MainLayout.tsx';

export default function Router() {
    const navigate = useNavigate();

    const earlyAccessDenied = useUser((state) => state.earlyAccessDenied);
    const auth = useUser((state) => state.auth);
    const fetchUserData = useUser((state) => state.fetchUserData);

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
                    <Route path={Path.IntiPage} element={<InitPage />} errorElement={<ErrorPage />} />

                    <Route element={<MainLayout />} errorElement={<ErrorPage />}>
                        <Route path={Path.HomePage} element={<HomePage />} errorElement={<ErrorPage />} />
                        <Route path={Path.SearchPage} element={<SearchPage />} errorElement={<ErrorPage />} />
                        <Route path={Path.PlaylistPage} element={<PlaylistPage />} errorElement={<ErrorPage />} />

                        <Route path={Path.AlbumPage} element={<AlbumPage />} errorElement={<ErrorPage />} />
                        <Route path={Path.ArtistPage} element={<ArtistPage />} errorElement={<ErrorPage />} />
                        <Route path={Path.DownloadsPage} element={<DownloadsPage />} errorElement={<ErrorPage />} />
                    </Route>

                    <Route path={Path.EarlyAccessPage} element={<EarlyAccessPage />} errorElement={<ErrorPage />} />

                    <Route path={'*'} element={<Navigate to={'/'} replace />} errorElement={<ErrorPage />} />
                </Routes>

                <Dialog />
                <Tooltip id="root-tooltip" variant={'light'} />
                <Toaster />
            </div>
        </div>
    );
}
