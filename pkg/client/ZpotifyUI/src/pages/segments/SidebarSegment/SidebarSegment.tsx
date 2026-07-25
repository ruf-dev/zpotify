import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import LogoRow from '@/pages/segments/SidebarSegment/components/LogoRow/LogoRow';
import NavItem from '@/pages/segments/SidebarSegment/components/NavItem/NavItem';
import SidebarArtistsWidget from '@/pages/segments/SidebarSegment/Widget/SidebarArtistsWidget/SidebarArtistsWidget';
import SidebarPlaylistsWidget from '@/pages/segments/SidebarSegment/Widget/SidebarPlaylistsWidget/SidebarPlaylistsWidget';
import cls from '@/pages/segments/SidebarSegment/SidebarSegment.module.css';
import { Path } from '@/app/routing/paths.ts';
import { useSidebarUI } from '@/shared/model/sidebarUIStore.ts';

type navIdentity = 'home' | 'search' | 'my_uploads';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', active: true, hideOnDesktop: true },
    { id: 'search', label: 'Search', active: false, hideOnDesktop: true },
    { id: 'my_uploads', label: 'My Uploads', active: false, disabled: true },
] as const;

export default function SidebarSegment() {
    const isCollapsed = useSidebarUI((state) => state.isCollapsed);
    const toggleCollapse = useSidebarUI((state) => state.toggleCollapsed);
    const isDrawerOpen = useSidebarUI((state) => state.isDrawerOpen);
    const closeDrawer = useSidebarUI((state) => state.closeDrawer);

    const navigate = useNavigate();

    function resolveNavigation(ni: navIdentity): () => void {
        return () => {
            closeDrawer();
            switch (ni) {
                case 'home':
                    navigate(Path.HomePage);
                    break;
                case 'search':
                    navigate(Path.SearchPage);
                    break;
            }
        };
    }

    return (
        <>
            <div className={cn(cls.Backdrop, isDrawerOpen && cls.BackdropVisible)} onClick={closeDrawer} />
            <aside
                className={cn(
                    cls.SidebarContainer,
                    isCollapsed && cls.SidebarContainerCollapsed,
                    isDrawerOpen && cls.SidebarContainerOpen,
                )}
            >
                <LogoRow isCollapsed={isCollapsed} onToggle={toggleCollapse} onLogoClick={resolveNavigation('home')} />

                <nav className={cls.NavSection}>
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.id}
                            {...item}
                            isCollapsed={isCollapsed}
                            onClick={resolveNavigation(item.id)}
                        />
                    ))}
                </nav>

                <SidebarArtistsWidget isCollapsed={isCollapsed} />

                <SidebarPlaylistsWidget isCollapsed={isCollapsed} />
            </aside>
        </>
    );
}
