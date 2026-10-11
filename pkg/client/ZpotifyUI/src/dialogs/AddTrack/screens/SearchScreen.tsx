import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import cls from '@/dialogs/AddTrack/screens/SearchScreen.module.css';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import TorrentSearchError from '@/dialogs/AddTrack/screens/components/TorrentSearchError/TorrentSearchError';
import TorrentSearchForm from '@/dialogs/AddTrack/screens/components/TorrentSearchForm/TorrentSearchForm';
import TorrentSearchResultRow from '@/dialogs/AddTrack/screens/components/TorrentSearchResultRow/TorrentSearchResultRow';
import TorrentSearchSkeleton from '@/dialogs/AddTrack/screens/components/TorrentSearchSkeleton/TorrentSearchSkeleton';
import { ServiceError } from '@/shared/api/Errors.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';

const STATUS_PRECONDITION_FAILED = 412;

function errorMessage(error: unknown): string {
    if (error instanceof ServiceError && error.statusCode === STATUS_PRECONDITION_FAILED) {
        return 'Torrent search is unavailable right now';
    }
    return 'Search failed';
}

export default function SearchScreen({ uploading, handleTorrentSearchResult }: AddTrackContext) {
    const [submittedQuery, setSubmittedQuery] = useState('');

    const query = useQuery({
        queryKey: ['torrentSearch', submittedQuery],
        queryFn: () => torrentService.SearchTorrents({ query: submittedQuery }).then((r) => r.results ?? []),
        enabled: submittedQuery !== '',
        retry: false,
    });

    const rows = useMemo(
        () =>
            (query.data ?? []).map((result) => (
                <TorrentSearchResultRow
                    key={result.id}
                    result={result}
                    isDisabled={uploading}
                    onPick={handleTorrentSearchResult}
                />
            )),
        [query.data, uploading, handleTorrentSearchResult],
    );

    function handleRetry() {
        query.refetch();
    }

    function renderBody() {
        if (submittedQuery === '') {
            return <span className={cls.Hint}>Search by artist, album or track name</span>;
        }
        if (query.isLoading) return <TorrentSearchSkeleton />;
        if (query.isError) return <TorrentSearchError message={errorMessage(query.error)} onRetry={handleRetry} />;
        if (rows.length === 0) return <span className={cls.Hint}>Nothing found</span>;

        return <div className={cls.ResultList}>{rows}</div>;
    }

    return (
        <div className={cls.SearchScreenContainer}>
            <TorrentSearchForm isDisabled={uploading} onSearch={setSubmittedQuery} />
            {renderBody()}
        </div>
    );
}
