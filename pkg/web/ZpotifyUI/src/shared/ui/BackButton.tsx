import cls from "@/shared/ui/BackButton.module.css";

interface BackButtonProps {
    onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
    return (
        <button className={cls.BackButtonContainer} type="button" onClick={onClick}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2L4 7l5 5"/>
            </svg>
        </button>
    );
}