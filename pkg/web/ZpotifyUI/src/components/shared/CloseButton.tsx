import cls from "@/components/shared/CloseButton.module.css";

interface CloseButtonProps {
    onClick: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <button className={cls.CloseButtonContainer} type="button" onClick={onClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round">
                <line x1="3" y1="3" x2="13" y2="13"/>
                <line x1="13" y1="3" x2="3" y2="13"/>
            </svg>
        </button>
    );
}
