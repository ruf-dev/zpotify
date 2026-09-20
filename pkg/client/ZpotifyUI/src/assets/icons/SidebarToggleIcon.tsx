import cn from 'classnames';

import cls from '@/assets/icons/SidebarToggleIcon.module.css';

interface SidebarToggleIconProps {
    isOpen?: boolean;
}

export function SidebarToggleIcon({ isOpen = false }: SidebarToggleIconProps) {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <line className={cn(cls.Line, isOpen && cls.LineTopOpen)} x1="1" y1="3" x2="13" y2="3" />
            <line className={cn(cls.Line, isOpen && cls.LineMiddleOpen)} x1="1" y1="7" x2="13" y2="7" />
            <line className={cn(cls.Line, isOpen && cls.LineBottomOpen)} x1="1" y1="11" x2="13" y2="11" />
        </svg>
    );
}
