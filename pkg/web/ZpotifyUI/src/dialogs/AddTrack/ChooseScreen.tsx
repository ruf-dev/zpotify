import cls from '@/dialogs/AddTrack/ChooseScreen.module.css';

interface ChooseScreenProps {
    onUploadNew: () => void;
}

export default function ChooseScreen({onUploadNew}: ChooseScreenProps) {
    return (
        <div className={cls.ChooseScreenContainer}>
            <div className={cls.GridWrapper}>
                <div className={cls.Card}>
                    <div className={cls.IconCircle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                    </div>
                    <span className={cls.CardTitle}>from library</span>
                    <span className={cls.CardSubtitle}>add existing tracks to a playlist</span>
                </div>

                <div className={`${cls.Card} ${cls.CardAccent}`} onClick={onUploadNew}>
                    <div className={cls.IconCircleAccent}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 16V4M8 8l4-4 4 4"/>
                            <path d="M4 20h16"/>
                        </svg>
                    </div>
                    <span className={cls.CardTitle}>upload new</span>
                    <span className={`${cls.CardSubtitle} ${cls.CardSubtitleAccent}`}>drop a file from your device</span>
                </div>
            </div>
        </div>
    );
}