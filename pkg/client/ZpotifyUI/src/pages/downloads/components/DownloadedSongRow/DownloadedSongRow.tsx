import { type MouseEvent } from 'react';
import cn from 'classnames';
import { Button } from '@vervstack/chures';

import cls from '@/pages/downloads/components/DownloadedSongRow/DownloadedSongRow.module.css';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';
import { PlayTriangleIcon } from '@/assets/icons/PlayTriangleIcon.tsx';
import { SpinnerIcon } from '@/assets/icons/SpinnerIcon.tsx';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon.tsx';

interface Props {
    title: string;
    artist: string;
    playlistName?: string;
    isCurrent: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    onPlay: () => void;
    onRemove: () => void;
}

export default function DownloadedSongRow(props: Props) {
    function handleRemoveClick(e: MouseEvent) {
        e.stopPropagation();
        props.onRemove();
    }

    return (
        <li
            className={cn(cls.DownloadedSongRowContainer, props.isCurrent && cls.DownloadedSongRowPlaying)}
            onClick={props.onPlay}
            role="row"
        >
            <span className={cls.PlayCell}>
                {props.isCurrent && props.isLoading ? (
                    <SpinnerIcon />
                ) : props.isCurrent && props.isPlaying ? (
                    <NowPlayingBars />
                ) : (
                    <PlayTriangleIcon />
                )}
            </span>

            <div className={cls.SongInfoWrapper}>
                <span className={cn(cls.SongTitle, props.isCurrent && cls.SongTitlePlaying)}>{props.title}</span>
                <span className={cls.SongArtist}>
                    {props.artist}
                    {props.playlistName ? ` · ${props.playlistName}` : ''}
                </span>
            </div>

            <Button
                variant="iconDanger"
                aria-label={`Remove ${props.title} from downloads`}
                onClick={handleRemoveClick}
            >
                <RemoveTrackIcon />
            </Button>
        </li>
    );
}
