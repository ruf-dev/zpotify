import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { GetArtistPageResponse, Playlist } from '@/app/api/zpotify';
import { Path } from '@/app/routing/paths.ts';
import { uuidToSeed } from '@/shared/api/PlaylistService.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import type { AlbumCardProps } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import CardRow from '@/components/CardRow/CardRow.tsx';
import ArtistHeroSegment from '@/widgets/ArtistScreen/segments/ArtistHeroSegment/ArtistHeroSegment.tsx';
import ArtistSongsRow from '@/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.tsx';
import cls from '@/widgets/ArtistScreen/ArtistScreenWidget.module.css';

interface Props {
    artistPage: GetArtistPageResponse;
}

function toAlbumCardProps(playlist: Playlist): AlbumCardProps {
    const uuid = playlist.uuid ?? '';
    return {
        uuid,
        name: playlist.name ?? '',
        artists: (playlist.artists ?? [])
            .filter((a): a is { uuid: string; name: string } => !!a.uuid && !!a.name)
            .map((a) => ({ uuid: a.uuid, name: a.name })),
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(playlist.coverFilePath),
    };
}

export default function ArtistScreenWidget({ artistPage }: Props) {
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);

    const artist = artistPage.artist!;
    const albums = artistPage.albums ?? [];
    const singles = artistPage.singles ?? [];
    const features = artistPage.features ?? [];

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handleEnterEditMode() {
        setEditMode(true);
    }

    function handleExitEditMode() {
        setEditMode(false);
    }

    return (
        <div className={cls.ArtistScreenContainer}>
            <ArtistHeroSegment
                artist={artist}
                onBack={handleBack}
                editMode={editMode}
                onEnterEditMode={handleEnterEditMode}
                onExitEditMode={handleExitEditMode}
            />

            <div className={cls.Separator} />

            <div className={cls.Rows}>
                {albums.length > 0 && (
                    <CardRow title="Albums">
                        {albums.map((a) => (
                            <div key={a.uuid} className={cls.AlbumCardWrapper}>
                                <AlbumCard {...toAlbumCardProps(a)} />
                            </div>
                        ))}
                    </CardRow>
                )}

                {singles.length > 0 && (
                    <ArtistSongsRow
                        title="Singles"
                        songs={singles}
                        queueSourceId={`artist-singles-${artist.uuid ?? ''}`}
                    />
                )}

                {features.length > 0 && (
                    <ArtistSongsRow
                        title="Features"
                        songs={features}
                        queueSourceId={`artist-features-${artist.uuid ?? ''}`}
                    />
                )}

                {albums.length === 0 && singles.length === 0 && features.length === 0 && (
                    <p className={cls.EmptyState}>This artist has no releases yet.</p>
                )}
            </div>
        </div>
    );
}
