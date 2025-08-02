import cls from '@/pages/init/InitPage.module.css';
import PlayerControls from "@/components/player/PlayerControls.tsx";
import api from "@/app/api/api.ts";
import AnimatedZ from "@/assets/AnimatedZ.tsx";

export default function InitPage() {
    const trackUrl = `${api()}/wapi/audio?fileId=AgADBGcAAscmoEg`;

    return (
        <div className={cls.HomePage}>
            <AnimatedZ/>
            <div
                className={cls.hiddenPlayer}
            >
                <PlayerControls
                    trackUrl={trackUrl}
                />
            </div>
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
