import cn from 'classnames';
import cls from '@/pages/segments/SidebarSegment/components/LogoRow/LogoRow.module.css';
import AnimatedZ from "@/assets/AnimatedZ.tsx";

interface LogoRowProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function LogoRow({isCollapsed, onToggle}: LogoRowProps) {
    return (
        <div className={cls.LogoRowContainer}>
            <div className={cls.LogoCircle} onClick={onToggle}>
                <AnimatedZ/>
            </div>
            <span className={cn(cls.Wordmark, {[cls.hidden]: isCollapsed})}>
                zpotify
            </span>
            <button type="button" className={cls.CollapseToggle} onClick={onToggle}>
                {isCollapsed ? '›' : '‹'}
            </button>
        </div>
    );
}
