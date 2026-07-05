import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';

interface CreatePlaylistCardProps {
    onClick: () => void;
}

export default function CreatePlaylistCard({ onClick }: CreatePlaylistCardProps) {
    return (
        <div className={cn(cls.Card, cls.CardWide)} onClick={onClick}>
            <div className={cls.IconCircle}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 6h11M3 12h11M3 18h7" />
                    <path d="M19 12v7M15.5 15.5h7" />
                </svg>
            </div>
            <div className={cls.CardWideText}>
                <span className={cls.CardTitle}>Create playlist</span>
                <span className={cls.CardSubtitle}>start an empty playlist and add tracks</span>
            </div>
        </div>
    );
}
