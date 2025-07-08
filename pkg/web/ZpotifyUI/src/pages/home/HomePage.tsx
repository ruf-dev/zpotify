import cls from '@/pages/home/HomePage.module.css';
import AnimatedZ from "@/assets/AnimatedZ.tsx";

export default function HomePage() {
    return (
        <div className={cls.HomePage}>
            <AnimatedZ/>
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
            <audio></audio>
        </div>
    )
}
