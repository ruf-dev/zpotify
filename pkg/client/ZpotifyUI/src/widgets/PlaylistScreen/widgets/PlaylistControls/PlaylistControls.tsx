import type { Playlist, SongBase } from '@/app/api/zpotify';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.module.css';
import PlayButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/PlayButton/PlayButton.tsx';
import ShuffleButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShuffleButton/ShuffleButton.tsx';
import SaveButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/SaveButton/SaveButton.tsx';
import ShareButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShareButton/ShareButton.tsx';
import EditControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/EditControls/EditControls.tsx';
import DownloadButtonWidget from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/DownloadButtonWidget/DownloadButtonWidget.tsx';

export interface PlaylistControlsProps {
    playlist: Playlist;
    songs: SongBase[];
    onPlay: () => void;
    saved: boolean;
    onToggleSave: () => void;
    editMode: boolean;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onEnterEditMode: () => void;
}

export default function PlaylistControls({
    playlist,
    songs,
    onPlay,
    saved,
    onToggleSave,
    editMode,
    saving,
    onSave,
    onCancel,
    onEnterEditMode,
}: PlaylistControlsProps) {
    return (
        <div className={cls.PlaylistControlsContainer}>
            <PlayButton onClick={onPlay} />
            <ShuffleButton />
            <SaveButton saved={saved} onToggleSave={onToggleSave} />
            <ShareButton />
            <DownloadButtonWidget playlist={playlist} songs={songs} />
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
