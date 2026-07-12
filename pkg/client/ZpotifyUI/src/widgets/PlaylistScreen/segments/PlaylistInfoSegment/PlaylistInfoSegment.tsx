import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/PlaylistInfoSegment.module.css';
import type { Playlist, SongBase } from '@/app/api/zpotify';
import BackButton from '@/shared/ui/BackButton.tsx';
import EditableCoverWithFallback from '@/widgets/PlaylistScreen/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx';
import EditableAlbumName from '@/widgets/PlaylistScreen/components/EditableAlbumName/EditableAlbumName.tsx';
import GenreChipsRow from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/components/GenreChipsRow/GenreChipsRow.tsx';
import ArtistOrOwnerRow from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/widgets/ArtistOrOwnerRow/ArtistOrOwnerRow.tsx';
import PlaylistMetaRow from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/widgets/PlaylistMetaRow/PlaylistMetaRow.tsx';
import DescriptionSection from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/widgets/DescriptionSection/DescriptionSection.tsx';
import PlaylistControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.tsx';
import { usePlaylistInfoSegment } from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/usePlaylistInfoSegment.ts';

export interface PlaylistInfoSegmentProps {
    playlist: Playlist;
    songs: SongBase[];
    totalDuration: string;
    trackCount: number;
    onBack: () => void;
    onPlay: () => void;
    editMode: boolean;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
}

export default function PlaylistInfoSegment(props: PlaylistInfoSegmentProps) {
    const { playlist, onBack, editMode } = props;
    const context = usePlaylistInfoSegment(props);

    return (
        <div className={cls.PlaylistInfoContainer}>
            <BackButton onClick={onBack} />

            <EditableCoverWithFallback {...context.coverProps} />

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>{context.playlistIsAlbum ? 'album' : 'playlist'}</span>

                <EditableAlbumName {...context.albumNameProps} />

                <ArtistOrOwnerRow
                    playlistIsAlbum={context.playlistIsAlbum}
                    artistPicker={context.artistPicker}
                    ownerLabelProps={context.ownerLabelProps}
                />

                <PlaylistMetaRow
                    showYear={context.showYear}
                    yearProps={context.yearProps}
                    trackCountProps={context.trackCountProps}
                />
            </div>

            {/* TODO: add tag editing row after release — ChipsField overflows the sidebar container in edit mode */}
            {!editMode && (playlist.tags?.length ?? 0) > 0 ? <GenreChipsRow tags={playlist.tags!} /> : null}

            <PlaylistControls {...context.controlsProps} />

            <DescriptionSection
                editMode={editMode}
                description={playlist.description}
                editDesc={context.editDesc}
                setEditDesc={context.setEditDesc}
                aboutExpanded={context.aboutExpanded}
                handleToggleAbout={context.handleToggleAbout}
            />

            {/* TODO: restore credits and label sections after release — requires GetAlbum metadata endpoint */}
        </div>
    );
}
