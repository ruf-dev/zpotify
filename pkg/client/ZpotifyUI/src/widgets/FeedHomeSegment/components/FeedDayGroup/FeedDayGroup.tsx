import { type ComponentType } from 'react';

import type { LibraryItem } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import type { FeedDay } from '@/widgets/FeedHomeSegment/model.ts';
import FeedSongRow from '@/widgets/FeedHomeSegment/components/FeedSongRow/FeedSongRow.tsx';
import FeedArtistChip from '@/widgets/FeedHomeSegment/components/FeedArtistChip/FeedArtistChip.tsx';
import cls from '@/widgets/FeedHomeSegment/components/FeedDayGroup/FeedDayGroup.module.css';

interface Props {
    day: FeedDay;
}

function choosePlaylistComponent(kind: LibraryItem['kind']): ComponentType<LibraryItem> {
    if (kind === 'album') return AlbumCard as ComponentType<LibraryItem>;
    return PlaylistCardWide as ComponentType<LibraryItem>;
}

export default function FeedDayGroup({ day }: Props) {
    const hasPlaylists = day.playlistsAdded.length > 0;
    const hasSongs = day.songsAdded.length > 0;
    const hasArtists = day.artistsAdded.length > 0;

    return (
        <div className={cls.FeedDayGroupContainer}>
            <p className={cls.DateHeading}>{new Date(day.date).toLocaleDateString()}</p>
            {hasPlaylists ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Playlists &amp; albums</p>
                    <div className={cls.PlaylistsStrip}>
                        {day.playlistsAdded.map((item) => {
                            const Component = choosePlaylistComponent(item.kind);
                            return <Component key={item.uuid} {...item} />;
                        })}
                    </div>
                </div>
            ) : null}
            {hasSongs ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Songs</p>
                    <div className={cls.SongsList}>
                        {day.songsAdded.map((song) => (
                            <FeedSongRow key={song.id} {...song} />
                        ))}
                    </div>
                </div>
            ) : null}
            {hasArtists ? (
                <div className={cls.Section}>
                    <p className={cls.SectionTitle}>Artists</p>
                    <div className={cls.ArtistsStrip}>
                        {day.artistsAdded.map((artist) => (
                            <FeedArtistChip key={artist.uuid} {...artist} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
