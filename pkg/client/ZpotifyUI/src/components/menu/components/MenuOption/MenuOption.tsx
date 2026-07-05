import cn from 'classnames';
import { useState } from 'react';

import cls from '@/components/menu/components/MenuOption/MenuOption.module.css';
import type { MenuOption as MenuOptionType } from '@/components/menu/Menu.tsx';

interface MenuOptionProps {
    props: MenuOptionType;
}

export default function MenuOption({ props }: MenuOptionProps) {
    const [isSelected, setIsSelected] = useState<boolean>(false);

    return (
        <div
            className={cn(cls.Option, {
                [cls.Selected]: isSelected,
                [cls.Disabled]: props.disabled,
            })}
            onPointerEnter={() => setIsSelected(true)}
            onPointerLeave={() => setIsSelected(false)}
            onClick={props.onClick}
        >
            {props.label}
        </div>
    );
}
