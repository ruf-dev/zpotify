import cls from '@/components/player/buttons/VolumeControls.module.scss';

import {AudioPlayer} from "@/hooks/player/player.ts";

interface VolumeControlsProps {
    audioPlayer: AudioPlayer
}

export default function VolumeControls({audioPlayer}: VolumeControlsProps) {
    return (
        <div className={cls.VolumeControl}>
            <div className={cls.SliderWrapper}>
                <div
                    className={cls.SoundLevel}
                    style={{
                        height: `${audioPlayer.volume}%`
                    }}
                />
            </div>

            <div
                className={cls.Display}
                style={{
                    background: `conic-gradient(#4caf50 ${audioPlayer.volume}%, #ddd ${audioPlayer.volume}% 100%)`,
                }}
            >
                <div className={cls.InnerRadius}>
                <span
                    style={{
                        fontSize: "70%",
                        color: "#333",
                        transition: "all 0.5s ease",
                    }}
                >
                  {Math.round(audioPlayer.volume)}%
                </span>
                </div>
            </div>
        </div>
    );
}
