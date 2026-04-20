import cls from "@/components/shared/Button.module.css";
import cn from "classnames";

interface ButtonProps {
    title: string
    isDisabled?: boolean
    onClick?: () => void
    className?: string
}

export default function Button({onClick, title, isDisabled, className}: ButtonProps) {
    return (
        <button
            className={cn(cls.ButtonContainer, className, {
                [cls.disabled]: isDisabled
            })}
            onClick={onClick}
            disabled={isDisabled}
        >
            {title}
        </button>
    )
}
