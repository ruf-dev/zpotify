import { type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import type { LibraryItem } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import type { FeedDay, FeedSongItem } from '@/widgets/FeedHomeSegment/model.ts';
import SongRow from '@/components/SongRow/SongRow.tsx';
import FeedArtistChip from '@/widgets/FeedHomeSegment/components/FeedArtistChip/FeedArtistChip.tsx';
import { artistPath } from '@/app/routing/paths.ts';
import cls from '@/widgets/FeedHomeSegment/components/FeedDayGroup/FeedDayGroup.module.css';

interface Props {
    day: FeedDay;
    onPlaySong: (song: FeedSongItem) => void;
}

function choosePlaylistComponent(kind: LibraryItem['kind']): ComponentType<LibraryItem> {
    if (kind === 'album') return AlbumCard as ComponentType<LibraryItem>;
    return PlaylistCardWide as ComponentType<LibraryItem>;
}

const feedItemTransition = { type: 'spring' as const, stiffness: 400, damping: 36 };

export default function FeedDayGroup({ day, onPlaySong }: Props) {
    const navigate = useNavigate();
    const hasPlaylists = day.playlistsAdded.length > 0;
    const hasSongs = day.songsAdded.length > 0;
    const hasArtists = day.artistsAdded.length > 0;

    function handleArtistClick(artistUuid: string) {
        navigate(artistPath(artistUuid));
    }

    return (
        <div className={cls.FeedDayGroupContainer}>
            <div className={cls.DateHeadingRow}>
                <span className={cls.DateHeadingLine} />
                <p className={cls.DateHeading}>{new Date(day.date).toLocaleDateString()}</p>
                <span className={cls.DateHeadingLine} />
            </div>
            {hasPlaylists ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Playlists &amp; albums</p>
                    <div className={cls.PlaylistsStrip}>
                        <AnimatePresence initial={false}>
                            {day.playlistsAdded.map((item) => {
                                const Component = choosePlaylistComponent(item.kind);
                                return (
                                    <motion.div
                                        key={item.uuid}
                                        layout
                                        initial={{ opacity: 0, y: -16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={feedItemTransition}
                                    >
                                        <Component {...item} />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            ) : null}
            {hasSongs ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Songs</p>
                    <div className={cls.SongsList}>
                        <AnimatePresence initial={false}>
                            {day.songsAdded.map((song) => (
                                <motion.div
                                    key={song.id}
                                    layout
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={feedItemTransition}
                                >
                                    <SongRow
                                        id={song.id}
                                        title={song.title}
                                        artists={song.artists}
                                        coverUrl={song.coverUrl}
                                        durationSec={song.durationSec}
                                        onPlay={() => onPlaySong(song)}
                                        onArtistClick={handleArtistClick}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : null}
            {hasArtists ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Artists</p>
                    <div className={cls.ArtistsStrip}>
                        <AnimatePresence initial={false}>
                            {day.artistsAdded.map((artist) => (
                                <motion.div
                                    key={artist.uuid}
                                    layout
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={feedItemTransition}
                                >
                                    <FeedArtistChip {...artist} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
