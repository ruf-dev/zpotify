import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useUser from '@/entities/user/useUser.ts';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { playlistPath } from '@/app/routing/paths.ts';
import { usePlaylist } from '@/pages/main/playlist/usePlaylist.ts';
import { usePlaylistSongs } from '@/entities/song/usePlaylistSongs.ts';
import PlaylistScreenWidget from '@/widgets/PlaylistScreen/PlaylistScreenWidget.tsx';
import SkeletonLoadScreen from '@/widgets/PlaylistScreen/screens/SkeletonLoadScreen/SkeletonLoadScreen.tsx';

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userData = useUser((state) => state.userData);
    const { playlist, isLoading: playlistLoading } = usePlaylist(id);
    const { songs, isInitialLoading: songsLoading, isListEnded, loadMore } = usePlaylistSongs(id);

    const notAnAlbum = !!playlist && !isAlbum(playlist);

    useEffect(() => {
        if (id && notAnAlbum) {
            navigate(playlistPath(id), { replace: true });
        }
    }, [id, notAnAlbum, navigate]);

    if (!id || !userData) return null;

    if (playlistLoading || songsLoading) return <SkeletonLoadScreen />;

    if (notAnAlbum) return null;

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
