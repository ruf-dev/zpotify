import { useState } from 'react';
import { Button, ConfirmDialog, Input } from '@vervstack/chures';
import cn from 'classnames';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import cls from '@/widgets/CachedSongsAccordion/CachedSongsAccordion.module.css';
import AccordionHeader from '@/widgets/CachedSongsAccordion/components/AccordionHeader/AccordionHeader.tsx';
import CachedSongRow from '@/widgets/CachedSongsAccordion/components/CachedSongRow/CachedSongRow.tsx';
import AlbumGroupRow from '@/widgets/CachedSongsAccordion/components/AlbumGroupRow/AlbumGroupRow.tsx';
import { type CachedSongEntry, useAudioCacheStore, useCachedSongs } from '@/shared/model/audioCacheStore.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const SINGLES_GROUP_KEY = 'singles';
const SINGLES_GROUP_LABEL = 'Singles';

interface AlbumGroup {
    key: string;
    label: string;
    songs: CachedSongEntry[];
}

function matchesQuery(song: CachedSongEntry, query: string): boolean {
    if (!query) return true;

    return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.playlistName?.toLowerCase().includes(query) ?? false)
    );
}

function groupSongsByAlbum(songs: CachedSongEntry[]): AlbumGroup[] {
    const albumGroups = new Map<string, AlbumGroup>();
    const singles: CachedSongEntry[] = [];

    songs.forEach((song) => {
        if (!song.isAlbum || !song.playlistUuid) {
            singles.push(song);
            return;
        }

        const existing = albumGroups.get(song.playlistUuid);
        if (existing) {
            existing.songs.push(song);
        } else {
            albumGroups.set(song.playlistUuid, {
                key: song.playlistUuid,
                label: song.playlistName || 'Unknown album',
                songs: [song],
            });
        }
    });

    const groups = Array.from(albumGroups.values());
    if (singles.length > 0) {
        groups.push({ key: SINGLES_GROUP_KEY, label: SINGLES_GROUP_LABEL, songs: singles });
    }

    return groups;
}

export default function CachedSongsAccordion() {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [groupByAlbum, setGroupByAlbum] = useState(false);
    const cachedSongs = useCachedSongs();
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();

    const normalizedQuery = query.trim().toLowerCase();
    const filteredSongs = cachedSongs.filter((song) => matchesQuery(song, normalizedQuery));
    const albumGroups = groupByAlbum ? groupSongsByAlbum(filteredSongs) : [];

    function handleToggle() {
        setExpanded((prev) => {
            const next = !prev;
            if (next) {
                useAudioCacheStore.getState().refreshCachedSongsMeta();
            }
            return next;
        });
    }

    function handleRemove(url: string) {
        useAudioCacheStore.getState().removeCachedUrl(url);
    }

    function handleToggleGroupByAlbum() {
        setGroupByAlbum((prev) => !prev);
    }

    function handleDeleteGroup(group: AlbumGroup) {
        return function handler() {
            async function handleConfirm() {
                await useAudioCacheStore.getState().removeCachedUrls(group.songs.map((song) => song.url));
                toaster.bake({
                    title: 'Cache cleared',
                    description: `${group.label} is no longer available offline`,
                    level: 'Info',
                });
                CloseDialog();
            }

            OpenDialog(
                <ConfirmDialog
                    title="Delete from cache"
                    message={`Remove all ${group.songs.length} cached track${group.songs.length === 1 ? '' : 's'} from "${group.label}"?`}
                    confirmLabel="Delete"
                    danger
                    onConfirm={handleConfirm}
                    onClose={CloseDialog}
                />,
            );
        };
    }

    return (
        <div className={cls.CachedSongsAccordionContainer}>
            <AccordionHeader
                label="Cached Songs"
                count={cachedSongs.length}
                expanded={expanded}
                onToggle={handleToggle}
            />

            <div className={cn(cls.AccordionBody, expanded && cls.AccordionBodyOpen)}>
                <div className={cls.AccordionBodyInner}>
                    {cachedSongs.length === 0 ? (
                        <p className={cls.EmptyState}>No cached songs yet</p>
                    ) : (
                        <>
                            <Input
                                value={query}
                                setValue={setQuery}
                                startIcon={<SearchIcon />}
                                placeholder="Search by title, author or playlist…"
                                className={cls.SearchInputWrapper}
                            />

                            <div className={cls.FilterRow}>
                                <Button
                                    className={cn(cls.AlbumsChip, groupByAlbum && cls.AlbumsChipActive)}
                                    onClick={handleToggleGroupByAlbum}
                                    aria-pressed={groupByAlbum}
                                >
                                    Albums
                                </Button>
                            </div>

                            <div className={cls.SongListScroll}>
                                {filteredSongs.length === 0 ? (
                                    <p className={cls.EmptyState}>No songs match your search</p>
                                ) : groupByAlbum ? (
                                    <ul className={cls.SongList}>
                                        {albumGroups.map((group) => (
                                            <AlbumGroupRow
                                                key={group.key}
                                                label={group.label}
                                                songs={group.songs}
                                                onRemoveSong={handleRemove}
                                                onDeleteGroup={handleDeleteGroup(group)}
                                            />
                                        ))}
                                    </ul>
                                ) : (
                                    <ul className={cls.SongList}>
                                        {filteredSongs.map((song) => (
                                            <CachedSongRow
                                                key={song.url}
                                                title={song.title}
                                                artist={song.artist}
                                                playlistName={song.playlistName}
                                                onRemove={() => handleRemove(song.url)}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
