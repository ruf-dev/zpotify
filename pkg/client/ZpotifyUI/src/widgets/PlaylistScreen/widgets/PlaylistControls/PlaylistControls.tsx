import type {Playlist, SongBase} from '@/app/api/zpotify';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.module.css';
import PlayButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/PlayButton/PlayButton.tsx';
import ShuffleButton
    from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShuffleButton/ShuffleButton.tsx';
import ShareButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShareButton/ShareButton.tsx';
import EditControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/EditControls/EditControls.tsx';
import DownloadButtonWidget
    from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/DownloadButtonWidget/DownloadButtonWidget.tsx';
import SaveButtonWidget
    from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/SaveButtonWidget/SaveButtonWidget.tsx';

export interface PlaylistControlsProps {
    playlist: Playlist;
    songs: SongBase[];
    onPlay: () => void;
    editMode: boolean;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onEnterEditMode: () => void;
}

export default function PlaylistControls(
    {
        playlist, songs, onPlay, editMode, saving, onSave, onCancel, onEnterEditMode,
    }: PlaylistControlsProps) {
    return (
        <div className={cls.PlaylistControlsContainer}>
            <PlayButton onClick={onPlay}/>

            <ShuffleButton/>

            <SaveButtonWidget uuid={playlist.uuid ?? ''} isSaved={playlist.isSaved ?? false}/>

            <ShareButton/>

            <DownloadButtonWidget playlist={playlist} songs={songs}/>

            <EditControls
                canEdit={playlist.canEdit}
                editMode={editMode}
                saving={saving}
                onSave={onSave}
                onCancel={onCancel}
                onEnterEditMode={onEnterEditMode}
            />
        </div>
    );
}
