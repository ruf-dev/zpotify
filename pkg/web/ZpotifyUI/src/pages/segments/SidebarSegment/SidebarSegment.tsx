import { useState } from 'react';
import cn from 'classnames';
import useUser from '@/entities/user/useUser';
import LogoRow from '@/pages/segments/SidebarSegment/components/LogoRow/LogoRow';
import NavItem from '@/pages/segments/SidebarSegment/components/NavItem/NavItem';
import ArtistRow from '@/pages/segments/SidebarSegment/components/ArtistRow/ArtistRow';
import PlaylistRow from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow';
import UserPill from '@/pages/segments/SidebarSegment/components/UserPill/UserPill';
import cls from '@/pages/segments/SidebarSegment/SidebarSegment.module.css';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', active: true },
    //
    { id: 'my_uploads', label: 'My Uploads', active: false },
] as const;

const ARTISTS = [
    { name: 'Doja Cat', tracks: 12, seed: '#d9007f' },
    { name: 'Tyler', tracks: 8, seed: '#0077e6' },
    { name: 'FKA Twigs', tracks: 5, seed: '#7400e6' },
] as const;

const PLAYLISTS = [
    { name: 'Late Night Vibes', tracks: 24, color: '#e6a800' },
    { name: 'Focus Mode', tracks: 18, color: '#00b36b' },
    { name: 'Hype', tracks: 31, color: '#e64400' },
    { name: 'Chill', tracks: 15, color: '#888888' },
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

            <div className={cls.ArtistsSection}>
                <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                    Your Artists
                </span>
                {ARTISTS.map(artist => (
                    <ArtistRow key={artist.name} {...artist} isCollapsed={isCollapsed} />
                ))}
            </div>

            <div className={cls.LibrarySection}>
                <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                    Your Library
                </span>
                {PLAYLISTS.map(playlist => (
                    <PlaylistRow key={playlist.name} {...playlist} isCollapsed={isCollapsed} />
                ))}
            </div>

            <UserPill username={username} isCollapsed={isCollapsed} />
        </aside>
    );
}
