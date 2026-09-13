import { ConfirmDialog } from '@vervstack/chures';

import cls from '@/pages/downloads/DownloadsPage.module.css';
import DownloadedSongRow from '@/pages/downloads/components/DownloadedSongRow/DownloadedSongRow.tsx';
import { type CachedSongEntry, useAudioCacheStore, useCachedSongs } from '@/shared/model/audioCacheStore.ts';
import useAudioPlayer, { type QueueTrack } from '@/widgets/MusicPlayer/usePlayer.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const QUEUE_SOURCE_ID = 'downloads';

function toQueueTrack(song: CachedSongEntry): QueueTrack {
    return {
        filePath: song.filePath,
        info: { title: song.title, artist: song.artist, artists: [], cover: null },
    };
}

export default function DownloadsPage() {
    const cachedSongs = useCachedSongs();
    const audioPlayer = useAudioPlayer();
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();

    function handlePlay(song: CachedSongEntry, idx: number) {
        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }

        const queueTracks = cachedSongs.map(toQueueTrack);
        const target = queueTracks[idx];
        audioPlayer.setQueue(queueTracks, idx, QUEUE_SOURCE_ID);
        audioPlayer.setSongInfo(target.info.title, target.info.artist, target.info.cover, target.info.artists);
        audioPlayer.play(target.filePath);
    }

    function handleRemove(song: CachedSongEntry) {
        async function handleConfirm() {
            await useAudioCacheStore.getState().removeCachedUrl(song.url);
            toaster.bake({
                title: 'Removed from downloads',
                description: `${song.title} is no longer available offline`,
                level: 'Info',
            });
            CloseDialog();
        }

        OpenDialog(
            <ConfirmDialog
                title="Remove download"
                message={`Remove "${song.title}" from your offline downloads?`}
                confirmLabel="Remove"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    return (
        <div className={cls.DownloadsPageContainer}>
            <h1 className={cls.Title}>Downloads</h1>
            <p className={cls.Subtitle}>Available offline, even when you&apos;re logged out or without a connection.</p>

            {cachedSongs.length === 0 ? (
                <p className={cls.EmptyState}>
                    No downloaded songs yet. Download a track or playlist to listen to it offline.
                </p>
            ) : (
                <ul className={cls.SongList}>
                    {cachedSongs.map((song, idx) => (
                        <DownloadedSongRow
                            key={song.url}
                            title={song.title}
                            artist={song.artist}
                            playlistName={song.playlistName}
                            isCurrent={audioPlayer.trackPath === song.filePath}
                            isPlaying={audioPlayer.isPlaying}
                            isLoading={audioPlayer.isLoading}
                            onPlay={() => handlePlay(song, idx)}
                            onRemove={() => handleRemove(song)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
