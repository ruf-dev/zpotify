import type { ReactNode } from 'react';

import cls from '@/components/menu/Menu.module.css';
import MenuOption from '@/components/menu/components/MenuOption/MenuOption.tsx';

interface MenuProps {
    options: MenuOption[];
}

export interface MenuOption {
    label?: string;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export default function Menu({ options }: MenuProps) {
    return (
        <div className={cls.MenuContainer}>
            {options.map((op, index) => {
                return (
                    <div key={index}>{op.label ? <MenuOption props={op} /> : <div className={cls.Separator} />}</div>
                );
            })}
        </div>
    );
}
