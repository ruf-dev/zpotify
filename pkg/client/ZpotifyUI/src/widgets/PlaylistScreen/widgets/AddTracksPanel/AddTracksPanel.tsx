import type { SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import cls from '@/widgets/PlaylistScreen/widgets/AddTracksPanel/AddTracksPanel.module.css';
import SongSearchBox from '@/widgets/SongSearchBox/SongSearchBox';
import DropZone from '@/features/upload/DropZone.tsx';
import { UploadArrowSmallIcon } from '@/assets/icons/UploadArrowSmallIcon.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import MultitrackUploadModal from '@/dialogs/MultitrackUpload/MultitrackUploadModal';

export interface AddTracksPanelProps {
    playlistUuid: string;
    existingSongIds: string[];
    playlistIsAlbum: boolean;
    playlistArtists: ArtistItem[];
}

export default function AddTracksPanel({
    playlistUuid,
    existingSongIds,
    playlistIsAlbum,
    playlistArtists,
}: AddTracksPanelProps) {
    const { OpenDialog } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);

    function handleAddSong(song: SongBase) {
        if (!song.id) return;
        playlistService
            .AddSongToPlaylist(playlistUuid, parseInt(song.id, 10))
            .then(() => refreshActive())
            .catch((e: unknown) => toaster.catch(e as never));
    }

    function handleFiles(files: File[]) {
        if (files.length === 0) return;

        OpenDialog(
            <MultitrackUploadModal
                files={files}
                targetPlaylist={{
                    uuid: playlistUuid,
                    artists: playlistIsAlbum ? playlistArtists : [],
                    existingSongIds,
                }}
            />,
        );
    }

    return (
        <div className={cls.AddTracksPanelContainer}>
            <SongSearchBox excludedIds={new Set(existingSongIds)} onAddSong={handleAddSong} />

            <DropZone onFiles={handleFiles} className={cls.DropZoneWrapper}>
                <div className={cls.DropZoneContent}>
                    <UploadArrowSmallIcon />
                    <span className={cls.DropZoneLabel}>drop audio files to add, or click to browse</span>
                </div>
            </DropZone>
        </div>
    );
}
