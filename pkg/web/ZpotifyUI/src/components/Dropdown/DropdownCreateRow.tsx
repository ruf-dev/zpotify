import cn from 'classnames';

import { PlusIcon } from '@/assets/icons/PlusIcon';
import cls from '@/components/Dropdown/Dropdown.module.css';

interface DropdownCreateRowProps {
    query: string;
    withBorder: boolean;
    onCreate: () => void;
}

export default function DropdownCreateRow({ query, withBorder, onCreate }: DropdownCreateRowProps) {
    function handleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        onCreate();
    }

    return (
        <div
            className={cn(cls.CreateRow, withBorder && cls.CreateRowWithBorder)}
            onMouseDown={handleMouseDown}
        >
            <span className={cls.CreateIcon}>
                <PlusIcon />
            </span>
            <span className={cls.CreateLabel}>create &ldquo;{query}&rdquo;</span>
        </div>
    );
}
