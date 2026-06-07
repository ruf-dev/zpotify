import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import cls from '@/widgets/PlaylistsLibrarySegment/PlaylistsLibrarySegment.module.css';

import useUser from '@/entities/user/useUser.ts';
import { playlistPath } from '@/app/routing/paths.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import AlbumCard from '@/widgets/PlaylistsLibrarySegment/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/PlaylistCardWide.tsx';

type TrackPreview = { title: string; artist: string };

type PlaylistData = {
    uuid?: string;
    name?: string;
    description?: string;
    artists?: Array<{ name?: string }>;
    songCount?: number;
};

type LibraryItem =
    | { kind: 'playlist'; playlist: PlaylistData; tracks: TrackPreview[] }
    | { kind: 'album'; playlist: PlaylistData };

function uuidToSeed(uuid: string): number {
    let sum = 0;
    for (const ch of uuid) sum += ch.charCodeAt(0);
    return (sum % 7) + 1;
}

function interleave(
    playlists: PlaylistData[],
    albums: PlaylistData[],
    trackMap: Record<string, TrackPreview[]>,
): LibraryItem[] {
    const result: LibraryItem[] = [];
    let pi = 0;
    let ai = 0;
    while (pi < playlists.length || ai < albums.length) {
        if (pi < playlists.length) {
            result.push({
                kind: 'playlist',
                playlist: playlists[pi++],
                tracks: trackMap[playlists[pi - 1].uuid ?? ''] ?? [],
            });
        }
        if (ai < albums.length) {
            result.push({ kind: 'album', playlist: albums[ai++] });
        }
        if (ai < albums.length) {
            result.push({ kind: 'album', playlist: albums[ai++] });
        }
    }
    return result;
}

export default function PlaylistsLibrarySegment() {
    const navigate = useNavigate();
    const toaster = useToaster();
    const Services = useUser((state) => state.Services);

    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(function fetchLibrary() {
        let cancelled = false;

        async function load() {
            try {
                const resp = await Services().Playlist().ListUserPlaylists(50, 0);
                if (cancelled) return;

                const all = resp.playlists ?? [];
                const albums = all.filter((p) => (p.artists?.length ?? 0) > 0);
                const playlists = all.filter((p) => (p.artists?.length ?? 0) === 0);

                const trackResults = await Promise.all(
                    playlists.map(async (p) => {
                        const uuid = p.uuid ?? '';
                        const songsResp = await Services().Playlist().ListSongs(uuid, 0, 5, undefined);
                        const tracks: TrackPreview[] = (songsResp.songs ?? []).map((s) => ({
                            title: s.title ?? '',
                            artist: (s.artists ?? []).map((a) => a.name ?? '').join(', '),
                        }));
                        return [uuid, tracks] as [string, TrackPreview[]];
                    }),
                );
                if (cancelled) return;

                const trackMap: Record<string, TrackPreview[]> = Object.fromEntries(trackResults);
                setItems(interleave(playlists, albums, trackMap));
            } catch (err) {
                if (!cancelled) toaster.catch(err as ServiceError);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return function cleanup() {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className={cls.PlaylistsLibrarySegmentContainer} />;
    }

    if (items.length === 0) {
        return (
            <div className={cls.PlaylistsLibrarySegmentContainer}>
                <span className={cls.Empty}>No playlists yet</span>
            </div>
        );
    }

    return (
        <div className={cls.PlaylistsLibrarySegmentContainer}>
            <div className={cls.Grid}>
                {items.map((item) => {
                    const { playlist } = item;
                    const uuid = playlist.uuid ?? '';
                    const seed = uuidToSeed(uuid);

                    if (item.kind === 'album') {
                        const artistNames = (playlist.artists ?? []).map((a) => a.name ?? '').join(', ');
                        return (
                            <AlbumCard
                                key={uuid}
                                uuid={uuid}
                                name={playlist.name ?? ''}
                                artistNames={artistNames}
                                seed={seed}
                                onClick={function handleAlbumClick() {
                                    navigate(playlistPath(uuid));
                                }}
                                onArtistClick={function handleArtistClick(e) {
                                    e.stopPropagation();
                                }}
                            />
                        );
                    }

                    return (
                        <PlaylistCardWide
                            key={uuid}
                            uuid={uuid}
                            name={playlist.name ?? ''}
                            songCount={playlist.songCount}
                            description={playlist.description}
                            seed={seed}
                            tracks={item.tracks}
                            onClick={function handlePlaylistClick() {
                                navigate(playlistPath(uuid));
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
