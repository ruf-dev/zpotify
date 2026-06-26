import { useParams } from 'react-router-dom';

import cls from '@/pages/main/playlist/PlaylistPage.module.css';
import type { Playlist } from '@/app/api/zpotify';

import useUser from '@/entities/user/useUser.ts';
import LazyLoadSongsList from '@/widgets/TrackList/LazyLoadSongsList.tsx';
import { usePlaylist } from '@/pages//main/playlist/usePlaylist.ts';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';

import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';


function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFileId ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
}

function buildCoverUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string | undefined) ?? '';
    return `${base}/${filePath}`;
}

interface PlaylistSidebarProps {
    playlist: Playlist;
    username: string;
}

function PlaylistSidebar({ playlist, username }: PlaylistSidebarProps) {
    const seed = resolveCoverSeed(playlist);
    const coverUrl = buildCoverUrl(playlist.coverFilePath);

    return (
        <div className={cls.Sidebar}>
            <div className={cls.CoverWrapper}>
                {coverUrl ? (
                    <img src={coverUrl} alt={playlist.name} className={cls.CoverImage} />
                ) : (
                    <GenerativeCover seed={seed} size={220} borderRadius="0" />
                )}
            </div>

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>playlist</span>
                <h1 className={cls.PlaylistName}>{playlist.name}</h1>
                <div className={cls.CuratorRow}>
                    <div className={cls.CuratorAvatar}>{username[0]?.toUpperCase() ?? '?'}</div>
                    <span className={cls.CuratorName}>{username}</span>
                </div>
                <span className={cls.TrackMeta}>{playlist.songCount ?? 0} tracks</span>
            </div>

            <div className={cls.ActionRow}>
                <button className={cls.PlayButton} type="button" aria-label="Play playlist">
                    <PlayIcon className={cls.PlayIcon} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Shuffle">
                    <RandomArrows />
                </button>
            </div>

            <div className={cls.Divider} />

            {playlist.description && <p className={cls.Description}>{playlist.description}</p>}
        </div>
    );
}

interface PlaylistMainContentProps {
    playlistId: string;
}

function PlaylistMainContent({ playlistId }: PlaylistMainContentProps) {
    return (
        <div className={cls.MainContent}>
            <div className={cls.TrackListHeader}>
                <span className={cls.ColNum}>#</span>
                <span className={cls.ColTitle}>title</span>
                <span className={cls.ColArtist}>artist</span>
            </div>
            <LazyLoadSongsList playlistId={playlistId} fixedSize />
        </div>
    );
}

export default function PlaylistPage() {
    const { id } = useParams<{ id: string }>();
    const userData = useUser((state) => state.userData);
    const { playlist } = usePlaylist(id);


    if (!id || !userData) return null;

    return (
        <div className={cls.PlaylistPageContainer}>
            <div className={cls.Body}>
                {playlist && <PlaylistSidebar playlist={playlist} username={userData.username}/>}
                <PlaylistMainContent playlistId={id}/>
            </div>
        </div>
    );
}
