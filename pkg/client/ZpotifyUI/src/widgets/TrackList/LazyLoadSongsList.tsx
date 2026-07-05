import cn from 'classnames';
import { useEffect } from 'react';

import cls from '@/widgets/TrackList/InfiniteSongsList.module.css';
import { useListSongs } from '@/entities/song/useListSongs.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import SongListWidget from '@/widgets/TrackList/TrackListWidget.tsx';
import ZButton from '@/shared/ui/ZButton/ZButton.tsx';

interface InfiniteSongsListProps {
    playlistId: string;
    fixedSize?: boolean;
    onTotal?: (total: number) => void;
    autoLoadAll?: boolean;
    coverUrl?: string;
}

export default function LazyLoadSongsList({ playlistId, fixedSize, onTotal, autoLoadAll, coverUrl }: InfiniteSongsListProps) {
    const audioPlayer = useAudioPlayer();
    const { songs, isListEnded, loadMore, loadShuffled } = useListSongs(playlistId, { onTotal, autoLoadAll });

    useEffect(() => {
        const hash = audioPlayer.shuffleHash?.toString();
        if (!hash) return;
        loadShuffled(hash).then((firstSongId) => {
            if (firstSongId) audioPlayer.play(firstSongId);
        });
    }, [audioPlayer.shuffleHash]);

    return (
        <div className={cn(cls.InfiniteSongsListContainer, { [cls.scrollable]: fixedSize })}>
            <SongListWidget songs={songs} audioPlayer={audioPlayer} coverUrl={coverUrl} />
            {!autoLoadAll && !isListEnded ? <ZButton title={'Load more'} onClick={loadMore} /> : null}
        </div>
    );
}
