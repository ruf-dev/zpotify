import cn from 'classnames';
import { useState } from 'react';

import cls from '@/widgets/MusicPlayer/buttons/components/VolumeBar/VolumeBar.module.css';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';

interface VolumeBarProps {
    audioPlayer: AudioPlayer;
}

export default function VolumeBar({ audioPlayer }: VolumeBarProps) {
    const [hover, setHover] = useState(false);
    const [lineY, setLineY] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);

    function handleVolumeChange(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newVolume = Math.min(100, Math.max(0, 100 - (y / rect.height) * 100));

        audioPlayer.setVolume(newVolume);
    }

    return (
        <div
            className={cls.SliderWrapper}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                setHover(false);
                setLineY(null);
                setDragging(false);
            }}
            onMouseDown={(e) => {
                setDragging(true);
                handleVolumeChange(e); // set immediately on click
            }}
            onMouseUp={() => setDragging(false)}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                setLineY(y);
                if (dragging) {
                    handleVolumeChange(e);
                }
            }}
        >
            <div
                className={cn(cls.SoundLevel, {
                    [cls.isMuted]: audioPlayer.isMuted,
                })}
                style={{
                    height: `${audioPlayer.volume}%`,
                }}
            />

            {hover && lineY !== null && (
                <div
                    className={cls.SoundLine}
                    style={{
                        top: `${lineY}px`,
                    }}
                />
            )}
        </div>
    );
}
