import { useParams } from 'react-router-dom';

import cls from '@/pages/playlist/PlaylistPage.module.css';
import type { Playlist } from '@/app/api/zpotify';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';
import useUser from '@/entities/user/useUser.ts';
import LazyLoadSongsList from '@/widgets/TrackList/LazyLoadSongsList.tsx';
import HeaderPart from '@/widgets/Header/HeaderPart.tsx';
import MusicPlayerWithLogo from '@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx';
import { usePlaylist } from '@/pages/playlist/usePlaylist.ts';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';

import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';

interface PlaylistPageProps {
    audioPlayer: AudioPlayer;
}

function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFileId ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
}

interface PlaylistSidebarProps {
    playlist: Playlist;
    username: string;
}

function PlaylistSidebar({ playlist, username }: PlaylistSidebarProps) {
    const seed = resolveCoverSeed(playlist);

    return (
        <div className={cls.Sidebar}>
            <div className={cls.CoverWrapper}>
                <GenerativeCover seed={seed} size={220} borderRadius="0" />
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
    audioPlayer: AudioPlayer;
}

function PlaylistMainContent({ playlistId, audioPlayer }: PlaylistMainContentProps) {
    return (
        <div className={cls.MainContent}>
            <div className={cls.TrackListHeader}>
                <span className={cls.ColNum}>#</span>
                <span className={cls.ColTitle}>title</span>
                <span className={cls.ColArtist}>artist</span>
            </div>
            <LazyLoadSongsList audioPlayer={audioPlayer} playlistId={playlistId} fixedSize />
        </div>
    );
}

export default function PlaylistPage({ audioPlayer }: PlaylistPageProps) {
    const { id } = useParams<{ id: string }>();
    const userData = useUser((state) => state.userData);
    const { playlist } = usePlaylist(id);


    if (!id || !userData) return null;

    return (
        <div className={cls.PlaylistPageContainer}>
            <div className={cls.Header}>
                <HeaderPart />
            </div>

            <div className={cls.Body}>
                {playlist && <PlaylistSidebar playlist={playlist} username={userData.username}/>}
                <PlaylistMainContent playlistId={id} audioPlayer={audioPlayer} />
            </div>

            <div className={cls.Player}>
                <MusicPlayerWithLogo audioPlayer={audioPlayer} />
            </div>
        </div>
    );
}
