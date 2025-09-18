import cls from "@/components/player/buttons/TrackProgressControls.module.scss"

import { AudioPlayer } from "@/hooks/player/player.ts";
import { useCallback, useEffect, useRef, useState } from "react";

interface TrackProgressControlsProps {
    audioPlayer: AudioPlayer
}

export default function TrackProgressControls({ audioPlayer }: TrackProgressControlsProps) {
    const trackLineRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(audioPlayer.progress);

    // Sync with audio progress when not dragging
    useEffect(() => {
        if (!isDragging) {
            setProgress(audioPlayer.progress);
        }
    }, [audioPlayer.progress, isDragging]);

    const calculateProgress = useCallback((clientX: number) => {
        if (!trackLineRef.current) return 0;
        const rect = trackLineRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(position * 100);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const newProgress = calculateProgress(e.clientX);
        setProgress(newProgress);
    }, [calculateProgress]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const newProgress = calculateProgress(e.clientX);
        setProgress(newProgress);
    }, [isDragging, calculateProgress]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
        }
    }, [isDragging, progress, audioPlayer]);

    // Global listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className={cls.TrackProgressControlsContainer}>
            <div
                ref={trackLineRef}
                className={cls.TrackLine}
                onMouseDown={handleMouseDown}
            >
                <div
                    className={cls.TrackBall}
                    style={{ left: `${progress}%` }}
                    onMouseDown={handleMouseDown}
                />
            </div>
        </div>
    );
}
