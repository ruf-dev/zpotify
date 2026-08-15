import cls from '@/features/upload/AddTrackButton.module.css';

interface AddTrackButtonProps {
    onClick: () => void;
}

export default function AddTrackButton({ onClick }: AddTrackButtonProps) {
    return (
        <button className={cls.AddTrackButtonContainer} onClick={onClick} type="button">
            <span className={cls.IconCircle}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <line x1="8" y1="2" x2="8" y2="14" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                </svg>
            </span>
            <span className={cls.Label}>Create</span>
        </button>
    );
}
