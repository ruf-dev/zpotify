import { useRef } from 'react';

import cls from '@/pages/segments/MobilePlayerSegment/components/MobilePlayerProgress/MobilePlayerProgress.module.css';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { formatDuration } from '@/shared/lib/time.ts';

function formatTime(secs: number): string {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    return formatDuration(Math.floor(secs));
}

export default function MobilePlayerProgress() {
    const audioPlayer = useAudioPlayer();
    const trackRef = useRef<HTMLDivElement>(null);

    function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        audioPlayer.setProgress(Math.max(0, Math.min(100, percent)));
    }

    return (
        <div className={cls.MobilePlayerProgressContainer}>
            <div className={cls.TrackWrapper} ref={trackRef} onClick={handleSeek}>
                <div className={cls.BufferedFill} style={{ width: `${audioPlayer.buffered}%` }} />
                <div className={cls.ProgressFill} style={{ width: `${audioPlayer.progress}%` }} />
            </div>
            <div className={cls.TimeRow}>
                <span className={cls.TimeLabel}>{formatTime(audioPlayer.currentTime)}</span>
                <span className={cls.TimeLabel}>{formatTime(audioPlayer.duration)}</span>
            </div>
        </div>
    );
}
