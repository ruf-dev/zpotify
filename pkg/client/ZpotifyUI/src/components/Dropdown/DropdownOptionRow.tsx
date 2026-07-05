import cn from 'classnames';

import { getOptionLabel } from '@/components/Dropdown/Dropdown.types';
import type { DropdownOption } from '@/components/Dropdown/Dropdown.types';
import cls from '@/components/Dropdown/Dropdown.module.css';

interface DropdownOptionRowProps {
    opt: DropdownOption;
    isSelected: boolean;
    multiSelect: boolean;
    onPick: (opt: DropdownOption) => void;
}

export default function DropdownOptionRow({ opt, isSelected, multiSelect, onPick }: DropdownOptionRowProps) {
    function handleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        onPick(opt);
    }

    return (
        <div
            className={cn(cls.OptionRow, isSelected && cls.OptionRowSelected)}
            onMouseDown={handleMouseDown}
        >
            {multiSelect && isSelected && <span className={cls.Checkmark}>✓</span>}
            {getOptionLabel(opt)}
        </div>
    );
}

