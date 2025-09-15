import cls from "@/components/player/buttons/TrackProgressControls.module.scss"

import {AudioPlayer} from "@/hooks/player/player.ts";
import {useCallback, useEffect, useRef, useState} from "react";

interface TrackProgressControlsProps {
    audioPlayer: AudioPlayer
}

export default function TrackProgressControls({audioPlayer}: TrackProgressControlsProps) {
    const trackLineRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const [progress, setProgress] = useState(audioPlayer.progress)

    useEffect(() => {
        if (!isDragging) {
            setProgress(audioPlayer.progress)
        }
    }, [audioPlayer.progress]);

    const calculateProgress = useCallback((clientX: number) => {
        if (!trackLineRef.current) return 0

        const rect = trackLineRef.current.getBoundingClientRect()
        const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        return Math.round(position * 100)
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        const progress = calculateProgress(e.clientX)
        audioPlayer.setProgress(progress)
    }, [audioPlayer, calculateProgress])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return
        const progress = calculateProgress(e.clientX)
        audioPlayer.setProgress(progress)
    }, [isDragging, audioPlayer, calculateProgress])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
        const handleGlobalMouseUp = () => handleMouseUp()

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove)
            document.addEventListener('mouseup', handleGlobalMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove)
            document.removeEventListener('mouseup', handleGlobalMouseUp)
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
        <div className={cls.TrackProgressControlsContainer}>
            <div
                ref={trackLineRef}
                className={cls.TrackLine}
                onMouseDown={handleMouseDown}>
                <div className={cls.TrackBall}
                     style={{ left:  `${progress}%` }}
                     onMouseDown={handleMouseDown}
                />
            </div>
        </div>
    )
}
