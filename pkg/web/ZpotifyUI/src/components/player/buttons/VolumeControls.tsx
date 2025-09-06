import cls from '@/components/player/buttons/VolumeControls.module.scss';

import {AudioPlayer} from "@/hooks/player/player.ts";
import {useState} from "react";

interface VolumeControlsProps {
    audioPlayer: AudioPlayer
}

export default function VolumeControls({audioPlayer}: VolumeControlsProps) {
    const [isSliderOpened, setIsSliderOpened] = useState(false);

    return (
        <div className={cls.VolumeControl}>
            <div
                className={cls.Display}
                onClick={() => setIsSliderOpened(!isSliderOpened)}
            >
                <VolumeDisplay
                    audioPlayer={audioPlayer}
                />
            </div>
            {isSliderOpened ? (<VolumeBar audioPlayer={audioPlayer}/>) : null}

        </div>
    );
}


function VolumeBar({audioPlayer}: { audioPlayer: AudioPlayer }) {
    const [hover, setHover] = useState(false);
    const [lineY, setLineY] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);

    function handleVolumeChange(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newVolume = Math.min(
            100,
            Math.max(0, 100 - (y / rect.height) * 100)
        );

        audioPlayer.setVolume(newVolume)
    }

    return (<div
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
            className={cls.SoundLevel}
            style={{
                height: `${audioPlayer.volume}%`
            }}
        />

        {hover && lineY !== null && (
            <div
                style={{
                    position: "absolute",
                    top: `${lineY}px`,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1px",
                    background: "red",
                    pointerEvents: "none",
                }}
            />)}
    </div>);
}

function VolumeDisplay({audioPlayer}: { audioPlayer: AudioPlayer }) {
    return (
        <div
            className={cls.Display}
            style={{
                background: `conic-gradient(#4caf50 ${audioPlayer.volume}%, #ddd ${audioPlayer.volume}% 100%)`,
            }}
        >
            <div className={cls.InnerRadius}>
                <div
                    style={{
                        fontSize: "70%",
                        color: "#333",
                        transition: "all 0.5s ease",
                    }}
                >
                    {Math.round(audioPlayer.volume)}%
                </div>
            </div>
        </div>)
}
