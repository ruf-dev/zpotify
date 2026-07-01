import {useState} from 'react';
import cn from 'classnames';
import useUser from '@/entities/user/useUser';
import LogoRow from '@/pages/segments/SidebarSegment/components/LogoRow/LogoRow';
import NavItem from '@/pages/segments/SidebarSegment/components/NavItem/NavItem';
import UserPill from '@/pages/segments/SidebarSegment/components/UserPill/UserPill';
import SidebarArtistsWidget from '@/pages/segments/SidebarSegment/Widget/SidebarArtistsWidget/SidebarArtistsWidget';
import SidebarPlaylistsWidget
    from '@/pages/segments/SidebarSegment/Widget/SidebarPlaylistsWidget/SidebarPlaylistsWidget';
import cls from '@/pages/segments/SidebarSegment/SidebarSegment.module.css';
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/paths.ts";


type navIdentity = 'home' | 'my_uploads'

const NAV_ITEMS = [
    {id: 'home', label: 'Home', active: true},
    {id: 'my_uploads', label: 'My Uploads', active: false},
] as const;

export default function SidebarSegment() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const userData = useUser(state => state.userData);
    const username = userData?.username ?? 'user';

    const navigate = useNavigate()

    function toggleCollapse() {
        setIsCollapsed(prev => !prev);
    }

    function resolveNavigation(ni: navIdentity): () => void {
        return () => {
            switch (ni) {
                case 'home':
                    navigate(Path.HomePage)
            }
        }
    }

    return (
        <aside className={cn(cls.SidebarContainer, isCollapsed && cls.SidebarContainerCollapsed)}>
            <LogoRow isCollapsed={isCollapsed} onToggle={toggleCollapse}/>

            <nav className={cls.NavSection}>
                {NAV_ITEMS.map(item => (
                    <NavItem
                        key={item.id}
                        {...item}
                        isCollapsed={isCollapsed}
                        onClick={resolveNavigation(item.id)}
                    />
                ))}
            </nav>

            <SidebarArtistsWidget isCollapsed={isCollapsed}/>

            <SidebarPlaylistsWidget isCollapsed={isCollapsed}/>

            <UserPill username={username} isCollapsed={isCollapsed}/>
        </aside>
    );
}
