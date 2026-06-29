import { useState } from 'react';

import cls from '@/pages/main/album/components/AlbumMainContent/AlbumMainContent.module.css';
import type { SongBase } from '@/app/api/zpotify';
import { selectFlagEnabled, useFeatureFlags } from '@/entities/feature-flags/useFeatureFlags.ts';
import { ClockIcon } from '@/assets/icons/ClockIcon.tsx';
import AlbumTrackRow from '@/pages/main/album/components/AlbumTrackRow/AlbumTrackRow.tsx';
import CommentsSection from '@/pages/main/album/components/CommentsSection/CommentsSection.tsx';

export interface AlbumMainContentProps {
    songs: SongBase[];
    currentTrackPath: string | null;
    onPlaySong: (song: SongBase) => void;
    username: string;
}

export default function AlbumMainContent({ songs, currentTrackPath, onPlaySong, username }: AlbumMainContentProps) {
    const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
    const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
    const commentsEnabled = useFeatureFlags((s) => selectFlagEnabled(s, 'IS_COMMENTS_ON_ALBUM_ENABLED'));

    function handleToggleLike(songId: string) {
        setLikedSongIds((prev) => {
            const next = new Set(prev);
            if (next.has(songId)) {
                next.delete(songId);
            } else {
                next.add(songId);
            }
            return next;
        });
        setAnimatingHeartId(songId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    return (
        <div className={cls.MainContentContainer}>
            <div className={cls.TrackListHeader}>
                <span className={cls.ColNum}>#</span>
                <span className={cls.ColTitle}>title</span>
                <span />
                <span className={cls.ColDuration}>
                    <ClockIcon />
                </span>
                <span />
            </div>

            <div className={cls.TrackList}>
                {songs.map((song, i) => (
                    <AlbumTrackRow
                        key={song.id}
                        song={song}
                        index={i + 1}
                        isPlaying={currentTrackPath === song.id}
                        isLiked={likedSongIds.has(song.id ?? '')}
                        isHeartAnimating={animatingHeartId === song.id}
                        onPlay={() => onPlaySong(song)}
                        onToggleLike={() => handleToggleLike(song.id ?? '')}
                    />
                ))}
            </div>

            {commentsEnabled && <CommentsSection username={username} />}
        </div>
    );
}
