import cls from '@/features/upload/AddTrackButton.module.css';

interface AddTrackButtonProps {
    onClick: () => void;
}

export default function AddTrackButton({ onClick }: AddTrackButtonProps) {
    return (
        <button className={cls.AddTrackButtonContainer} onClick={onClick} type="button">
            <span className={cls.IconCircle}>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <line x1="6" y1="1" x2="6" y2="11" />
                    <line x1="1" y1="6" x2="11" y2="6" />
                </svg>
            </span>
            <span className={cls.Label}>add track</span>
        </button>
    );
}
