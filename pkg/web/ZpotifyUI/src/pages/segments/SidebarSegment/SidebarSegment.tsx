import { useState } from 'react';
import cn from 'classnames';
import useUser from '@/entities/user/useUser';
import LogoRow from '@/pages/segments/SidebarSegment/components/LogoRow/LogoRow';
import NavItem from '@/pages/segments/SidebarSegment/components/NavItem/NavItem';
import UserPill from '@/pages/segments/SidebarSegment/components/UserPill/UserPill';
import SidebarArtistsWidget from '@/pages/segments/SidebarSegment/Widget/SidebarArtistsWidget/SidebarArtistsWidget';
import SidebarPlaylistsWidget from '@/pages/segments/SidebarSegment/Widget/SidebarPlaylistsWidget/SidebarPlaylistsWidget';
import cls from '@/pages/segments/SidebarSegment/SidebarSegment.module.css';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', active: true },
    //
    { id: 'my_uploads', label: 'My Uploads', active: false },
] as const;

export default function SidebarSegment() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const userData = useUser(state => state.userData);
    const username = userData?.username ?? 'user';

    function toggleCollapse() {
        setIsCollapsed(prev => !prev);
    }

    return (
        <aside className={cn(cls.SidebarContainer, isCollapsed && cls.SidebarContainerCollapsed)}>
            <LogoRow isCollapsed={isCollapsed} onToggle={toggleCollapse} />

            <nav className={cls.NavSection}>
                {NAV_ITEMS.map(item => (
                    <NavItem key={item.id} {...item} isCollapsed={isCollapsed} />
                ))}
            </nav>

            <SidebarArtistsWidget isCollapsed={isCollapsed} />

            <SidebarPlaylistsWidget isCollapsed={isCollapsed} />

            <UserPill username={username} isCollapsed={isCollapsed} />
        </aside>
    );
}
