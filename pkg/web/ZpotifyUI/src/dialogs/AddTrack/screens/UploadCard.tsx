import cls from '@/dialogs/AddTrack/screens/UploadCard.module.css';

interface UploadCardProps {
    atLimit: boolean;
    loading: boolean;
    pendingCount: number;
    uploadLimit: number;
    onClick: () => void;
}

export default function UploadCard({ atLimit, loading, pendingCount, uploadLimit, onClick }: UploadCardProps) {
    return (
        <div
            className={`${cls.UploadCardContainer} ${atLimit ? cls.CardDisabled : ''}`}
            onClick={atLimit ? undefined : onClick}
        >
            <div className={cls.IconCircleAccent}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 16V4M8 8l4-4 4 4" />
                    <path d="M4 20h16" />
                </svg>
            </div>
            <span className={cls.CardTitle}>upload new</span>
            <span className={`${cls.CardSubtitle} ${atLimit ? '' : cls.CardSubtitleAccent}`}>
                {atLimit ? 'upload limit reached' : 'drop a file from your device'}
            </span>
            {!loading && (
                <span className={`${cls.UsageChip} ${atLimit ? cls.UsageChipLimit : ''}`}>
                    {pendingCount} / {uploadLimit}
                </span>
            )}
        </div>
    );
}
