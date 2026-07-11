import {Button} from '@vervstack/chures';
import cn from 'classnames';

import type {Playlist, SongBase} from '@/app/api/zpotify';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.module.css';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import {HeartIcon} from '@/assets/icons/HeartIcon.tsx';
import {ShareIcon} from '@/assets/icons/ShareIcon.tsx';
import EditIcon from '@/assets/icons/EditIcon.tsx';
import SaveIcon from '@/assets/icons/SaveIcon.tsx';
import {RemoveIcon} from '@/assets/icons/RemoveIcon.tsx';
import {DownloadIcon} from '@/assets/icons/DownloadIcon.tsx';
import {HomeIcon} from '@/assets/icons/HomeIcon.tsx';
import {RemoveTrackIcon} from '@/assets/icons/RemoveTrackIcon.tsx';
import {usePlaylistControls} from '@/widgets/PlaylistScreen/widgets/PlaylistControls/usePlaylistControls.tsx';

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
    const {allCached, downloadDisabled, downloadButtonStyle, onDownloadClick} = usePlaylistControls({
        playlist,
        songs,
    });

    return (
        <div className={cls.PlaylistControlsContainer}>
            <Button
                variant="unstyled"
                className={cls.PlayButton}
                aria-label="Play album"
                onClick={onPlay}>
                <PlayIcon className={cls.PlayIcon}/>
            </Button>

            <Button
                variant="unstyled"
                className={cls.IconButton}
                aria-label="Shuffle">
                <RandomArrows/>
            </Button>
            <Button
                variant="unstyled"
                className={cn(cls.IconButton, saved && cls.IconButtonActive)}
                aria-label={saved ? 'Remove from library' : 'Save to library'}
                onClick={onToggleSave}
            >
                <HeartIcon filled={saved}/>
            </Button>
            <Button
                variant="unstyled"
                className={cls.IconButton}
                aria-label="Share">
                <ShareIcon/>
            </Button>
            <Button
                variant="unstyled"
                className={cn(cls.IconButton, allCached && cls.IconButtonActive, allCached && cls.IconButtonCached)}
                aria-label={allCached ? 'Unload cache' : 'Download'}
                onClick={onDownloadClick}
                disabled={downloadDisabled}
                // eslint-disable-next-line react/forbid-component-props -- --progress is a runtime value driving a CSS gradient; no static module class can express it
                style={downloadButtonStyle}
            >
                {allCached ? (
                    <span className={cls.CachedIconStack}>
                        <span className={cls.CachedIconDefault}>
                            <HomeIcon/>
                        </span>
                        <span className={cls.CachedIconHover}>
                            <RemoveTrackIcon/>
                        </span>
                    </span>
                ) : (
                    <DownloadIcon/>
                )}
            </Button>
            {playlist.canEdit &&
                (editMode ? (
                    <>
                        <Button
                            variant="unstyled"
                            className={cls.SaveIconButton}
                            aria-label="Save changes"
                            onClick={onSave}
                            disabled={saving}
                        >
                            <SaveIcon/>
                        </Button>
                        <Button
                            variant="unstyled"
                            className={cls.IconButton}
                            aria-label="Cancel editing"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            <RemoveIcon/>
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="unstyled"
                        className={cn(cls.IconButton, cls.EditButton)}
                        aria-label="Edit"
                        onClick={onEnterEditMode}
                    >
                        <EditIcon/>
                    </Button>
                ))}
        </div>
    );
}
