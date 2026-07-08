import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useUser from '@/entities/user/useUser.ts';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { albumPath } from '@/app/routing/paths.ts';
import { Errors, ServiceError } from '@/shared/api/Errors.ts';
import { usePlaylist } from '@/pages/main/playlist/usePlaylist.ts';
import { usePlaylistSongs } from '@/entities/song/usePlaylistSongs.ts';
import PlaylistScreenWidget from '@/widgets/PlaylistScreen/PlaylistScreenWidget.tsx';
import SkeletonLoadScreen from '@/widgets/PlaylistScreen/screens/SkeletonLoadScreen/SkeletonLoadScreen.tsx';
import NotFoundScreen from '@/widgets/PlaylistScreen/screens/NotFoundScreen/NotFoundScreen.tsx';

export default function PlaylistPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userData = useUser((state) => state.userData);
    const { playlist, isLoading: playlistLoading, error: playlistError } = usePlaylist(id);
    const { songs, isLoading: songsLoading, isListEnded, loadMore } = usePlaylistSongs(id);

    const isActuallyAlbum = !!playlist && isAlbum(playlist);
    const isNotFound = playlistError instanceof ServiceError && playlistError.code === Errors.NOT_FOUND;

    useEffect(() => {
        if (id && isActuallyAlbum) {
            navigate(albumPath(id), { replace: true });
        }
    }, [id, isActuallyAlbum, navigate]);

    if (!id || !userData) return null;

    if (playlistLoading || songsLoading) return <SkeletonLoadScreen />;

    if (isNotFound) return <NotFoundScreen />;

    if (isActuallyAlbum) return null;

    return (
        <PlaylistScreenWidget
            playlist={playlist}
            songs={songs}
            username={userData.username ?? ''}
            isListEnded={isListEnded}
            onLoadMore={loadMore}
        />
    );
}
