import cn from 'classnames';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import IconButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.tsx';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/DownloadButtonWidget/DownloadButtonWidget.module.css';
import { useDownloadButtonWidget } from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/DownloadButtonWidget/useDownloadButtonWidget.tsx';
import { DownloadIcon } from '@/assets/icons/DownloadIcon.tsx';
import { HomeIcon } from '@/assets/icons/HomeIcon.tsx';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon.tsx';

export interface DownloadButtonWidgetProps {
    playlist: Playlist;
    songs: SongBase[];
}

export default function DownloadButtonWidget({ playlist, songs }: DownloadButtonWidgetProps) {
    const { allCached, downloadDisabled, downloadButtonStyle, onDownloadClick } = useDownloadButtonWidget({
        playlist,
        songs,
    });

    return (
        <IconButton
            active={allCached}
            className={cn(allCached && cls.IconButtonCached)}
            ariaLabel={allCached ? 'Unload cache' : 'Download'}
            onClick={onDownloadClick}
            disabled={downloadDisabled}
            // eslint-disable-next-line react/forbid-component-props -- style is a passthrough for runtime CSS vars (download progress); no static module class can express it
            style={downloadButtonStyle}
        >
            {allCached ? (
                <span className={cls.CachedIconStack}>
                    <span className={cls.CachedIconDefault}>
                        <HomeIcon />
                    </span>
                    <span className={cls.CachedIconHover}>
                        <RemoveTrackIcon />
                    </span>
                </span>
            ) : (
                <DownloadIcon />
            )}
        </IconButton>
    );
}
