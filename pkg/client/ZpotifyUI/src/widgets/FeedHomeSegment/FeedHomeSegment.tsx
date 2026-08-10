import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { feedService } from '@/shared/api/FeedService.ts';
import ZButton from '@/shared/ui/ZButton/ZButton.tsx';
import { useFeedRefresh } from '@/entities/feed/useFeedRefresh.ts';
import type { FeedDay, FeedSongItem } from '@/widgets/FeedHomeSegment/model.ts';
import FeedDayGroup from '@/widgets/FeedHomeSegment/components/FeedDayGroup/FeedDayGroup.tsx';
import FeedHomeSegmentSkeleton from '@/widgets/FeedHomeSegment/FeedHomeSegmentSkeleton.tsx';
import cls from '@/widgets/FeedHomeSegment/FeedHomeSegment.module.css';
import useAudioPlayer, { QueueTrack } from '@/widgets/MusicPlayer/usePlayer.ts';

const PAGE_SIZE_DAYS = 14;

export default function FeedHomeSegment() {
    const toaster = useToaster();
    const audioPlayer = useAudioPlayer();
    const [days, setDays] = useState<FeedDay[]>([]);
    const [totalDays, setTotalDays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const refreshVersion = useFeedRefresh((s) => s.version);
    const prevRefreshVersion = useRef(refreshVersion);

    useEffect(fetchFeed, []);

    useEffect(() => {
        if (refreshVersion === prevRefreshVersion.current) return;
        prevRefreshVersion.current = refreshVersion;
        refreshFeed();
    }, [refreshVersion]);

    function fetchFeed() {
        feedService
            .GetFeed(PAGE_SIZE_DAYS, 0)
            .then((result) => {
                setDays(result.days);
                setTotalDays(result.totalDays);
            })
            .catch(toaster.catch)
            .finally(() => setLoading(false));
    }

    function refreshFeed() {
        feedService
            .GetFeed(Math.max(days.length, PAGE_SIZE_DAYS), 0)
            .then((result) => {
                setDays(result.days);
                setTotalDays(result.totalDays);
            })
            .catch(toaster.catch);
    }

    function playFeedSong(song: FeedSongItem) {
        if (!song.filePath) return;

        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }

        const track: QueueTrack = {
            filePath: song.filePath,
            info: {
                title: song.title || null,
                artist: song.artists.map((a) => a.name).join(', ') || null,
                artists: song.artists,
                cover: song.coverUrl ?? null,
            },
        };

        audioPlayer.setQueue([track], 0, `feed-song-${song.id}`);
        audioPlayer.setSongInfo(track.info.title, track.info.artist, track.info.cover, track.info.artists);
        void audioPlayer.play(track.filePath);
    }

    function loadMore() {
        if (loadingMore) return;

        setLoadingMore(true);
        feedService
            .GetFeed(PAGE_SIZE_DAYS, days.length)
            .then((result) => {
                setDays((prev) => [...prev, ...result.days]);
                setTotalDays(result.totalDays);
            })
            .catch(toaster.catch)
            .finally(() => setLoadingMore(false));
    }

    if (loading) {
        return <FeedHomeSegmentSkeleton />;
    }

    if (days.length === 0) {
        return (
            <div className={cls.FeedHomeSegmentContainer}>
                <span className={cls.Empty}>No activity yet</span>
            </div>
        );
    }

    return (
        <div className={cls.FeedHomeSegmentContainer}>
            <div className={cls.DayList}>
                <AnimatePresence initial={false}>
                    {days.map((day) => (
                        <motion.div
                            key={day.date}
                            layout
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                        >
                            <FeedDayGroup day={day} onPlaySong={playFeedSong} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {days.length < totalDays ? (
                <div className={cls.LoadMoreWrapper}>
                    <ZButton title={loadingMore ? 'Loading…' : 'Load more'} onClick={loadMore} />
                </div>
            ) : null}
        </div>
    );
}
