import cn from 'classnames';
import {useEffect, useState} from 'react';

import type {SongBase} from '@/app/api/zpotify';
import cls from '@/widgets/TrackList/InfiniteSongsList.module.css';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import {useToaster} from '@/hooks/toaster/ToasterZ.ts';
import {playlistService} from '@/shared/api/PlaylistService.ts';
import SongListWidget from '@/widgets/TrackList/TrackListWidget.tsx';
import ZButton from '@/shared/ui/ZButton/ZButton.tsx';

interface InfiniteSongsListProps {
    playlistId: string;

    fixedSize?: boolean;

    onTotal?: (total: number) => void;

    autoLoadAll?: boolean;
}

const songsPerPage = 25;

export default function LazyLoadSongsList({playlistId, fixedSize, onTotal, autoLoadAll}: InfiniteSongsListProps) {
    const audioPlayer = useAudioPlayer();

    const [offset, setOffset] = useState(0);
    const [shuffleHash, setShuffleHash] = useState<string | undefined>();

    const [songs, setSongs] = useState<SongBase[]>([]);
    const [totalSongs, setTotalSongs] = useState(0);
    const [isListEnded, setIsListEnded] = useState(false);

    const toaster = useToaster();

    function loadTracksPage() {
        playlistService
            .ListSongs(playlistId, offset, songsPerPage, shuffleHash?.toString())
            .then((resp) => {
                resp.songs = resp.songs || [];

                setSongs((prev) => [
                    ...prev,
                    ...(resp.songs || []).filter((newSong) => {
                        return !prev.some((old) => old.id == newSong.id);
                    }),
                ]);

                const total = resp.total || 0;
                setTotalSongs(total);

                if (onTotal != null && resp.total != null) onTotal(resp.total);

                if (autoLoadAll && offset + songsPerPage < total) {
                    setOffset((prev) => prev + songsPerPage);
                }
            })
            .catch(toaster.catch);
    }

    async function loadTracksShuffled(hash: string): Promise<string> {
        return playlistService
            .ListSongs(playlistId, 0, songs.length, hash)
            .then((resp) => {
                if (!resp.songs) return;

                setSongs(resp.songs);
                setIsListEnded(resp.total == resp.songs?.length);

                return resp.songs[0].id;
            })
            .catch(toaster.catch)
            .then();
    }

    useEffect(() => {
        loadTracksPage();
    }, [offset]);

    useEffect(() => {
        setIsListEnded(totalSongs == songs.length);
    }, [songs, totalSongs]);

    useEffect(() => {
        if (!shuffleHash) return;

        loadTracksShuffled(shuffleHash).then((firstSongId) => {
            audioPlayer.play(firstSongId);
        });
    }, [shuffleHash]);

    useEffect(() => {
        setShuffleHash(audioPlayer.shuffleHash?.toString());
    }, [audioPlayer.shuffleHash]);

    function loadMore() {
        setOffset(offset + songsPerPage);
    }

    return (
        <div
            className={
                cn(cls.InfiniteSongsListContainer, {
                    [cls.scrollable]: fixedSize,
                })}
        >
            <SongListWidget songs={songs} audioPlayer={audioPlayer}/>

            {!autoLoadAll && !isListEnded ? <ZButton title={'Load more'} onClick={loadMore}/> : null}
        </div>
    );
}
