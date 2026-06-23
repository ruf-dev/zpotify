import cn from 'classnames';

import { LockIcon } from '@/assets/icons/LockIcon';
import { RemoveIcon } from '@/assets/icons/RemoveIcon';
import cls from '@/components/Chip/Chip.module.css';

export interface ChipProps {
    label: string;
    onRemove?: () => void;
    locked?: boolean;
    isDragging?: boolean;
    isDragOver?: boolean;
    dragHandlers?: React.DOMAttributes<HTMLSpanElement>;
}


export default function Chip({ label, onRemove, locked, isDragging, isDragOver, dragHandlers }: ChipProps) {
    function handleRemoveClick(e: React.MouseEvent) {
        e.stopPropagation();
        onRemove?.();
    }

    if (locked) {
        return (
            <span className={cls.LockedChip}>
                <span className={cls.LockIcon}>
                    <LockIcon />
                </span>
                <span className={cls.ChipName}>{label}</span>
            </span>
        );
    }

    return (
        <span
            className={cn(cls.Chip, isDragging && cls.ChipDragging, isDragOver && cls.ChipDragOver)}
            {...dragHandlers}
        >
            <span className={cls.ChipName}>{label}</span>
            {onRemove && (
                <span className={cls.RemoveBtn} onClick={handleRemoveClick} aria-label={`remove ${label}`}>
                    <RemoveIcon />
                </span>
            )}
        </span>
    );
}
