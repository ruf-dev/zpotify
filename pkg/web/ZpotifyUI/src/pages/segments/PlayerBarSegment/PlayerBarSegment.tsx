import { useRef } from 'react';
import cn from 'classnames';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer';
import cls from './PlayerBarSegment.module.css';

const COVER_COLORS: readonly string[] = [
    'rgba(217,0,127,0.9)',
    'rgba(124,58,237,0.9)',
    'rgba(14,165,233,0.9)',
    'rgba(16,185,129,0.9)',
    'rgba(245,158,11,0.9)',
    'rgba(239,68,68,0.9)',
    'rgba(139,92,246,0.9)',
];

function computeCoverColor(title: string | null): string {
    if (!title) return COVER_COLORS[0];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash += title.charCodeAt(i);
    }
    return COVER_COLORS[hash % 7];
}

export default function PlayerBarSegment() {
    const audioPlayer = useAudioPlayer();
    const progressTrackRef = useRef<HTMLDivElement>(null);

    const { isPlaying, songTitle, songArtist, songCover, progress } = audioPlayer;
    const coverColor = computeCoverColor(songTitle);

    function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
        const el = progressTrackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        audioPlayer.setProgress(Math.max(0, Math.min(100, percent)));
    }

    function handleTogglePlay() {
        audioPlayer.togglePlay();
    }

    function handlePlayPrev() {
        audioPlayer.playPrev();
    }

    function handlePlayNext() {
        audioPlayer.playNext();
    }

    return (
        <div className={cls.PlayerBarContainer}>
            <div className={cls.TrackInfoWrapper}>
                {songCover ? (
                    <img src={songCover} alt={songTitle ?? ''} className={cls.CoverPlaceholder} />
                ) : (
                    <div className={cls.CoverPlaceholder} style={{ backgroundColor: coverColor }} />
                )}
                <div className={cls.TrackTextWrapper}>
                    <span
                        className={cn(
                            cls.SongTitle,
                            !songTitle && cls.SongTitleEmpty,
                            isPlaying && songTitle && cls.SongTitlePlaying,
                        )}
                    >
                        {songTitle ?? 'nothing playing'}
                    </span>
                    {songArtist && (
                        <span className={cls.SongArtist}>{songArtist}</span>
                    )}
                </div>
            </div>

            <div className={cls.ControlsCenterWrapper}>
                <div className={cls.ButtonsRow}>
                    <button className={cls.ControlButton} onClick={handlePlayPrev}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="1" y="1" width="2" height="12" />
                            <polygon points="11,1 3,7 11,13" />
                        </svg>
                    </button>

                    <button
                        className={cn(cls.PlayPauseButton, isPlaying && cls.PlayPauseButtonPlaying)}
                        onClick={handleTogglePlay}
                    >
                        {isPlaying ? (
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M3,2 h3 v10 H3 z" />
                                <path d="M9,2 h3 v10 H9 z" />
                            </svg>
                        ) : (
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M4,2 L14,7.5 L4,13 Z" />
                            </svg>
                        )}
                    </button>

                    <button className={cls.ControlButton} onClick={handlePlayNext}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="11" y="1" width="2" height="12" />
                            <polygon points="3,1 11,7 3,13" />
                        </svg>
                    </button>
                </div>

                <div className={cls.ProgressRow}>
                    <span className={cls.TimeLabel}>—:——</span>
                    <div
                        className={cls.ProgressTrackWrapper}
                        ref={progressTrackRef}
                        onClick={handleProgressClick}
                    >
                        <div
                            className={cls.ProgressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={cls.TimeLabel}>—:——</span>
                </div>
            </div>

            <div className={cls.NowPlayingWrapper}>
                {isPlaying && (
                    <div className={cls.BarsContainer}>
                        <span className={cn(cls.Bar, cls.Bar1)} />
                        <span className={cn(cls.Bar, cls.Bar2)} />
                        <span className={cn(cls.Bar, cls.Bar3)} />
                    </div>
                )}
            </div>
        </div>
    );
}
