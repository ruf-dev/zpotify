import { useRef, useState } from 'react';
import cn from 'classnames';
import useAudioPlayer, { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer';
import { formatDuration } from '@/shared/lib/time.ts';
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

function formatTime(secs: number): string {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    return formatDuration(Math.floor(secs));
}

export default function PlayerBarSegment() {
    const audioPlayer = useAudioPlayer();
    const progressTrackRef = useRef<HTMLDivElement>(null);

    const { isPlaying, songTitle, songArtist, songCover, progress, currentTime, duration } = audioPlayer;
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
                    <span className={cls.TimeLabel}>{formatTime(currentTime)}</span>
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
                    <span className={cls.TimeLabel}>{formatTime(duration)}</span>
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
                <VolumeControl audioPlayer={audioPlayer} />
            </div>
        </div>
    );
}

function VolumeControl({ audioPlayer }: { audioPlayer: AudioPlayer }) {
    const volumeTrackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const { volume, isMuted } = audioPlayer;
    const displayVolume = isMuted ? 0 : volume;
    const isSilent = isMuted || volume === 0;

    function computeVolumeFromEvent(e: React.PointerEvent<HTMLDivElement>) {
        const el = volumeTrackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        audioPlayer.setVolume(Math.max(0, Math.min(100, percent)));
    }

    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        computeVolumeFromEvent(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!dragging) return;
        computeVolumeFromEvent(e);
    }

    function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDragging(false);
    }

    function handleToggleMute() {
        audioPlayer.toggleMute();
    }

    return (
        <div className={cls.VolumeWrapper}>
            <button
                type="button"
                className={cls.VolumeButton}
                onClick={handleToggleMute}
                aria-label={isSilent ? 'Unmute' : 'Mute'}
            >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2,6 H5 L9,2.5 V13.5 L5,10 H2 Z" />
                    {!isSilent && (
                        <path d="M11,5 A4,4 0 0,1 11,11" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    )}
                    {isSilent && (
                        <path d="M11.5,5.5 L14.5,8.5 M14.5,5.5 L11.5,8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    )}
                </svg>
            </button>
            <div
                className={cls.VolumeTrackWrapper}
                ref={volumeTrackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <div
                    className={cn(cls.VolumeFill, dragging && cls.VolumeFillActive)}
                    style={{ width: `${displayVolume}%` }}
                />
            </div>
        </div>
    );
}
