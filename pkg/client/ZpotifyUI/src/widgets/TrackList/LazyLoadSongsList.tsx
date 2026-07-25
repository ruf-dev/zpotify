import cn from 'classnames';
import { useEffect } from 'react';

import cls from '@/widgets/TrackList/InfiniteSongsList.module.css';
import { useListSongs } from '@/entities/song/useListSongs.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { toQueueTracks } from '@/widgets/MusicPlayer/toQueueTracks.ts';
import SongListWidget from '@/widgets/TrackList/TrackListWidget.tsx';
import ZButton from '@/shared/ui/ZButton/ZButton.tsx';

interface InfiniteSongsListProps {
    playlistId: string;
    fixedSize?: boolean;
    onTotal?: (total: number) => void;
    autoLoadAll?: boolean;
    coverUrl?: string;
}

export default function LazyLoadSongsList({
    playlistId,
    fixedSize,
    onTotal,
    autoLoadAll,
    coverUrl,
}: InfiniteSongsListProps) {
    const audioPlayer = useAudioPlayer();
    const { songs, isListEnded, loadMore, loadShuffled } = useListSongs(playlistId, { onTotal, autoLoadAll });

    useEffect(() => {
        const hash = audioPlayer.shuffleHash?.toString();
        if (!hash) return;
        loadShuffled(hash).then((shuffledSongs) => {
            const queueTracks = toQueueTracks(shuffledSongs, coverUrl);
            const first = queueTracks[0];
            if (!first) return;
            audioPlayer.setQueue(queueTracks, 0, playlistId);
            audioPlayer.setSongInfo(first.info.title, first.info.artist, first.info.cover, first.info.artists);
            audioPlayer.play(first.filePath);
        });
    }, [audioPlayer.shuffleHash]);

    return (
        <div className={cn(cls.InfiniteSongsListContainer, { [cls.scrollable]: fixedSize })}>
            <SongListWidget songs={songs} audioPlayer={audioPlayer} coverUrl={coverUrl} queueSourceId={playlistId} />
            {!autoLoadAll && !isListEnded ? <ZButton title={'Load more'} onClick={loadMore} /> : null}
        </div>
    );
}
