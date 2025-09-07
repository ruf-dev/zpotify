import cn from "classnames";

import cls from '@/components/player/buttons/VolumeControls.module.scss';
import {AudioPlayer} from "@/hooks/player/player.ts";
import {useState} from "react";

interface VolumeControlsProps {
    audioPlayer: AudioPlayer
}

export default function VolumeControls({audioPlayer}: VolumeControlsProps) {
    const [isSliderOpened, setIsSliderOpened] = useState(false);

    return (
        <div className={cls.VolumeControlContainer}
             onMouseEnter={() => setIsSliderOpened(true)}
             onMouseLeave={() => setIsSliderOpened(false)}
        >
            <div className={cls.VolumeControl}>
                <div className={cls.Display}>
                    <VolumeDisplay
                        audioPlayer={audioPlayer}
                    />
                </div>

                {isSliderOpened && (<VolumeBar audioPlayer={audioPlayer}/>)}

            </div>
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
                    height: `${audioPlayer.volume}%`
                }}
            />

            {hover && lineY !== null && (
                <div
                    className={cls.SoundLine}
                    style={{
                        top: `${lineY}px`,
                    }}
                />)}
        </div>);
}

function VolumeDisplay({audioPlayer}: { audioPlayer: AudioPlayer }) {
    return (
        <div
            className={cls.Display}
            style={{
                background: `
                    conic-gradient(${audioPlayer.isMuted ? "" : "var(--accent-fg-color) " + audioPlayer.volume + "%,"}
                     var(--disabled-fg-color) ${audioPlayer.volume}% 100%)`,
            }}
            onClick={audioPlayer.toggleMute}
        >
            <div className={cls.InnerRadius}>
                <div
                    style={{
                        fontSize: "70%",
                        color: "#333",
                        transition: "all 0.5s ease",
                    }}
                >
                    {audioPlayer.isMuted ? "M" : Math.round(audioPlayer.volume) + "%"}
                </div>
            </div>
        </div>)
}
