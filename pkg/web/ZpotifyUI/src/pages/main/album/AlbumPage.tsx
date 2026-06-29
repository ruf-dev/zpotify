import { useParams } from 'react-router-dom';

import useUser from '@/entities/user/useUser.ts';
import { usePlaylist } from '@/pages/main/playlist/usePlaylist.ts';
import { useAlbumSongs } from '@/pages/main/album/useAlbumSongs.ts';
import AlbumPageScreen from '@/pages/main/album/screens/AlbumPageScreen/AlbumPageScreen.tsx';
import AlbumPageSkeletonLoadScreen from '@/pages/main/album/screens/AlbumPageSkeletonLoadScreen/AlbumPageSkeletonLoadScreen.tsx';

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();
    const userData = useUser((state) => state.userData);
    const { playlist, isLoading: playlistLoading } = usePlaylist(id);
    const { songs, isLoading: songsLoading } = useAlbumSongs(id);

    if (!id || !userData) return null;

    if (songsLoading || playlistLoading) return <AlbumPageSkeletonLoadScreen/>;

    return <AlbumPageScreen playlist={playlist} songs={songs} username={userData.username ?? ''} />;
}
