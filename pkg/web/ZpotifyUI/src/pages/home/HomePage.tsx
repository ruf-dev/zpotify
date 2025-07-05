import cls from '@/pages/home/HomePage.module.css';
import logo from "/logo.svg";

export default function HomePage() {
    return (
        <div className={cls.HomePage}>
            <img
                className={cls.Logo}
                src={logo}
                alt={""}/>
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
            <audio></audio>
        </div>
    )
}
