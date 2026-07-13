import type { Playlist, SongBase } from '@/app/api/zpotify';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.module.css';
import PlayButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/PlayButton/PlayButton.tsx';
import InfoControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/InfoControls/InfoControls.tsx';
import EditControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/EditControls/EditControls.tsx';
import PrivateLockWidget from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/PrivateLockWidget/PrivateLockWidget.tsx';

export interface PlaylistControlsProps {
    playlist: Playlist;
    songs: SongBase[];
    onPlay: () => void;
    isPlaying: boolean;
    editMode: boolean;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onEnterEditMode: () => void;
}

export default function PlaylistControls(props: PlaylistControlsProps) {
    const { playlist, songs, editMode } = props;

    return (
        <div className={cls.PlaylistControlsContainer}>
            <PlayButton onClick={props.onPlay} isPlaying={props.isPlaying} />

            {!editMode && <InfoControls playlist={playlist} songs={songs} />}

            {editMode && (
                <PrivateLockWidget
                    uuid={playlist.uuid ?? ''}
                    isPublic={playlist.isPublic ?? false}
                    canEdit={playlist.canEdit}
                />
            )}

            <EditControls
                canEdit={playlist.canEdit}
                editMode={editMode}
                saving={props.saving}
                onSave={props.onSave}
                onCancel={props.onCancel}
                onEnterEditMode={props.onEnterEditMode}
            />
        </div>
    );
}
