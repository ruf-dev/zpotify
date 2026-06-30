import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { playlistService } from '@/shared/api/PlaylistService';
import PlaylistRow from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow';
import cls from '@/pages/segments/SidebarSegment/Widget/SidebarPlaylistsWidget/SidebarPlaylistsWidget.module.css';

interface PlaylistItem {
    uuid: string;
    name: string;
    tracks: number;
    color: string;
    coverUrl?: string;
}

function uuidToHslColor(uuid: string): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) hash = (hash * 31 + uuid.charCodeAt(i)) | 0;
    return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

function buildCoverUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string | undefined) ?? '';
    return `${base}/${filePath}`;
}

interface SidebarPlaylistsWidgetProps {
    isCollapsed: boolean;
}

export default function SidebarPlaylistsWidget({ isCollapsed }: SidebarPlaylistsWidgetProps) {
    const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

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
                    name={playlist.name}
                    tracks={playlist.tracks}
                    color={playlist.color}
                    coverUrl={playlist.coverUrl}
                    isCollapsed={isCollapsed}
                />
            ))}
        </div>
    );
}
