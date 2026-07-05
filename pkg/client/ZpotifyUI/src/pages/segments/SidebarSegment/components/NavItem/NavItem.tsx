import cn from 'classnames';
import {HomeIcon} from '@/assets/icons/HomeIcon';
import {NavSearchIcon} from '@/assets/icons/NavSearchIcon';
import {UploadsIcon} from '@/assets/icons/UploadsIcon';
import cls from '@/pages/segments/SidebarSegment/components/NavItem/NavItem.module.css';

function getNavIcon(id: string) {
    if (id === 'home') return <HomeIcon/>;
    if (id === 'search') return <NavSearchIcon/>;
    return <UploadsIcon/>;
}

interface NavItemProps {
    id: string;
    label: string;
    active: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}

export default function NavItem({id, label, active, isCollapsed, onClick}: NavItemProps) {
    return (
        <div
            className={cn(
                cls.NavItem,
                {
                    [cls.active]: active,
                    [cls.NavItemCollapsed]: isCollapsed,
                }
            )}
            onClick={onClick}
            data-tooltip-id={!active ? 'root-tooltip' : undefined}
            data-tooltip-content={'Not implemented yet'}
        >
            {getNavIcon(id)}
            <span className={cn(cls.NavItemLabel, {
                [cls.NavItemLabelHidden]: isCollapsed
            })}>
                {label}
            </span>
        </div>
    );
}
