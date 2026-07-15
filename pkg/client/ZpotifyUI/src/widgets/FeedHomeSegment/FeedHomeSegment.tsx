import { useEffect, useState } from 'react';

import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { feedService } from '@/shared/api/FeedService.ts';
import ZButton from '@/shared/ui/ZButton/ZButton.tsx';
import type { FeedDay } from '@/widgets/FeedHomeSegment/model.ts';
import FeedDayGroup from '@/widgets/FeedHomeSegment/components/FeedDayGroup/FeedDayGroup.tsx';
import FeedHomeSegmentSkeleton from '@/widgets/FeedHomeSegment/FeedHomeSegmentSkeleton.tsx';
import cls from '@/widgets/FeedHomeSegment/FeedHomeSegment.module.css';

const PAGE_SIZE_DAYS = 14;

export default function FeedHomeSegment() {
    const toaster = useToaster();
    const [days, setDays] = useState<FeedDay[]>([]);
    const [totalDays, setTotalDays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(fetchFeed, []);

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
                {days.map((day) => (
                    <FeedDayGroup key={day.date} day={day} />
                ))}
            </div>
            {days.length < totalDays ? (
                <div className={cls.LoadMoreWrapper}>
                    <ZButton title={loadingMore ? 'Loading…' : 'Load more'} onClick={loadMore} />
                </div>
            ) : null}
        </div>
    );
}
