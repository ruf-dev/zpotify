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
            <audio controls>
                <source src="http://localhost:8087/wapi/audio/CQACAgIAAxkBAAMOaGjpbYLz_IY6_wHiwtxSjQvZAcQAAvABAALs5vlJwnxurt15HQM2BA" type="audio/ogg" />
                Your browser does not support the audio element.
            </audio>
            <p className={cls.WorkInProgressHeader}>
               Zpotify Soon, There will be some great music. Keep in touch. Гойда, братья!
            </p>
        </div>
    )
}
