import cn from 'classnames';

import { PlusIcon } from '@/assets/icons/PlusIcon';
import cls from '@/components/Dropdown/Dropdown.module.css';

interface DropdownCreateRowProps {
    query: string;
    withBorder: boolean;
    onCreate: () => void;
    disabled?: boolean;
}

export default function DropdownCreateRow({ query, withBorder, onCreate, disabled = false }: DropdownCreateRowProps) {
    function handleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        if (disabled) return;
        onCreate();
    }

    return (
        <div
            className={cn(cls.CreateRow, withBorder && cls.CreateRowWithBorder, disabled && cls.CreateRowDisabled)}
            onMouseDown={handleMouseDown}
        >
            <span className={cls.CreateIcon}>
                <PlusIcon />
            </span>
            <span className={cls.CreateLabel}>{disabled ? 'creating…' : <>create &ldquo;{query}&rdquo;</>}</span>
        </div>
    );
}
