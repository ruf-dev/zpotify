import { useState } from 'react';
import type { CSSProperties } from 'react';
import cn from 'classnames';
import useUser from '@/entities/user/useUser';
import cls from './SidebarSegment.module.css';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', active: true },
    { id: 'search', label: 'Search', active: false },
    { id: 'uploads', label: 'Uploads', active: false },
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

function HomeIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2,17 L2,8 L10,2 L18,8 L18,17 L13,17 L13,12 L7,12 L7,17 Z" />
        </svg>
    );
}

function SearchNavIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="9" cy="9" r="6" />
            <line x1="13.5" y1="13.5" x2="18" y2="18" />
        </svg>
    );
}

function UploadsIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10,14 L10,4 M6,8 L10,4 L14,8" />
            <line x1="4" y1="16" x2="16" y2="16" />
        </svg>
    );
}

function getNavIcon(id: string) {
    if (id === 'home') return <HomeIcon />;
    if (id === 'search') return <SearchNavIcon />;
    return <UploadsIcon />;
}

export default function SidebarSegment() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const userData = useUser(state => state.userData);
    const username = userData?.username ?? 'user';

    function handleToggle() {
        setIsCollapsed(prev => !prev);
    }

    return (
        <aside className={cn(cls.SidebarContainer, isCollapsed && cls.SidebarContainerCollapsed)}>
            <div className={cls.LogoRow}>
                <div className={cls.LogoCircle} />
                <span className={cn(cls.Wordmark, isCollapsed && cls.WordmarkHidden)}>
                    zpotify
                </span>
                <button type="button" className={cls.CollapseToggle} onClick={handleToggle}>
                    {isCollapsed ? '›' : '‹'}
                </button>
            </div>

            <nav className={cls.NavSection}>
                {NAV_ITEMS.map(item => (
                    <div
                        key={item.id}
                        className={cn(
                            cls.NavItem,
                            item.active && cls.NavItemActive,
                            isCollapsed && cls.NavItemCollapsed,
                        )}
                    >
                        {getNavIcon(item.id)}
                        <span className={cn(cls.NavItemLabel, isCollapsed && cls.NavItemLabelHidden)}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </nav>

            <div className={cls.ArtistsSection}>
                <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                    Your Artists
                </span>
                {ARTISTS.map(artist => (
                    <div
                        key={artist.name}
                        className={cn(cls.ArtistRow, isCollapsed && cls.ArtistRowCollapsed)}
                    >
                        <div
                            className={cn(cls.ArtistAvatar, isCollapsed && cls.ArtistAvatarCollapsed)}
                            style={{ '--seed': artist.seed } as CSSProperties}
                        >
                            {artist.name[0]}
                        </div>
                        <div className={cn(cls.ArtistInfoWrapper, isCollapsed && cls.ArtistInfoWrapperHidden)}>
                            <span className={cls.ArtistName}>{artist.name}</span>
                            <span className={cls.ArtistTracks}>{artist.tracks} tracks</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cls.LibrarySection}>
                <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                    Your Library
                </span>
                {PLAYLISTS.map(playlist => (
                    <div
                        key={playlist.name}
                        className={cn(cls.PlaylistRow, isCollapsed && cls.PlaylistRowCollapsed)}
                    >
                        <div
                            className={cls.PlaylistCover}
                            style={{ '--playlist-color': playlist.color } as CSSProperties}
                        />
                        <div className={cn(cls.PlaylistInfoWrapper, isCollapsed && cls.PlaylistInfoWrapperHidden)}>
                            <span className={cls.PlaylistName}>{playlist.name}</span>
                            <span className={cls.PlaylistTracks}>{playlist.tracks} tracks</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cls.UserPill}>
                <div className={cls.UserAvatar}>
                    {username[0].toUpperCase()}
                </div>
                <span className={cn(cls.UserName, isCollapsed && cls.UserNameHidden)}>
                    {username}
                </span>
            </div>
        </aside>
    );
}
