import cn from 'classnames';

import cls from '@/shared/ui/Button.module.css';

interface ButtonProps {
    title: string;
    isDisabled?: boolean;
    onClick?: () => void;
    className?: string;
}

export default function Button({ onClick, title, isDisabled, className }: ButtonProps) {
    return (
        <button
            className={cn(cls.ButtonContainer, className, {
                [cls.disabled]: isDisabled,
            })}
            onClick={onClick}
            disabled={isDisabled}
        >
            {title}
        </button>
    );
}
