import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { playlistService } from '@/shared/api/PlaylistService';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh';
import PlaylistRow from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow';
import type { PlaylistRowData } from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow';
import cls from '@/pages/segments/SidebarSegment/Widget/SidebarPlaylistsWidget/SidebarPlaylistsWidget.module.css';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';

type PlaylistItem = PlaylistRowData;

function uuidToHslColor(uuid: string): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) hash = (hash * 31 + uuid.charCodeAt(i)) | 0;
    return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

interface SidebarPlaylistsWidgetProps {
    isCollapsed: boolean;
}

export default function SidebarPlaylistsWidget({ isCollapsed }: SidebarPlaylistsWidgetProps) {
    const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();
    const version = usePlaylistListRefresh((s) => s.version);

    useEffect(function fetchPlaylists() {
        playlistService
            .ListUserPlaylists(50, 0)
            .then((resp) => {
                const items = (resp.playlists ?? []).map((p) => ({
                    uuid: p.uuid ?? '',
                    name: p.name ?? '',
                    tracks: p.songCount ?? 0,
                    color: uuidToHslColor(p.uuid ?? ''),
                    coverUrl: buildCoverUrl(p.coverFilePath),
                }));
                setPlaylists(items);
                setLoaded(true);
            })
            .catch(() => {
                setLoaded(true);
            });
    }, [version]);

    function handleCreateClick() {
        void navigate('/');
    }

    return (
        <div className={cls.SidebarPlaylistsWidgetContainer}>
            <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                Your Library
            </span>
            {loaded && playlists.length === 0 && (
                <div className={cn(cls.EmptyState, isCollapsed && cls.EmptyStateHidden)}>
                    <span className={cls.EmptyStateText}>No playlists yet</span>
                    <button className={cls.CreateButton} onClick={handleCreateClick}>
                        Create playlist
                    </button>
                </div>
            )}
            {playlists.map((playlist) => (
                <PlaylistRow
                    key={playlist.uuid} 
                    {...playlist}
                    isCollapsed={isCollapsed} />
            ))}
        </div>
    );
}
