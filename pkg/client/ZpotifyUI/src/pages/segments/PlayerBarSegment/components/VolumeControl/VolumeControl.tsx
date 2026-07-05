import cn from 'classnames';
import { useRef, useState } from 'react';

import cls from '@/pages/segments/PlayerBarSegment/components/VolumeControl/VolumeControl.module.css';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer';

interface VolumeControlProps {
    audioPlayer: AudioPlayer;
}

export default function VolumeControl({ audioPlayer }: VolumeControlProps) {
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
                        <path
                            d="M11,5 A4,4 0 0,1 11,11"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}
                    {isSilent && (
                        <path
                            d="M11.5,5.5 L14.5,8.5 M14.5,5.5 L11.5,8.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                        />
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
