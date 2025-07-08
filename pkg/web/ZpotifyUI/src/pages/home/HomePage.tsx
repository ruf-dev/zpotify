import cls from '@/pages/home/HomePage.module.css';
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {useState} from "react";

export default function HomePage() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className={cls.HomePage}>
            <div
                className={cls.Logo +' '+ (isPlaying ? '' : cls.paused )}
                onClick={() => setIsPlaying(!isPlaying)}

            >

                <AnimatedZ/>
            </div>
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
            <audio></audio>
        </div>
    )
}
