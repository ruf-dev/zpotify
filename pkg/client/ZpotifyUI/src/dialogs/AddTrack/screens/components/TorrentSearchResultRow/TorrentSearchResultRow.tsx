import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/TorrentSearchResultRow/TorrentSearchResultRow.module.css';
import type { TorrentSearchResult } from '@/app/api/zpotify';
import {
    formatTorrentAge,
    formatTorrentSize,
    isLosslessTitle,
} from '@/dialogs/AddTrack/screens/processes/torrentSearchResult';

interface TorrentSearchResultRowProps {
    result: TorrentSearchResult;
    isDisabled: boolean;
    onPick: (id: string) => void;
}

export default function TorrentSearchResultRow({ result, isDisabled, onPick }: TorrentSearchResultRowProps) {
    const title = result.title ?? '';

    function handlePick() {
        if (result.id) onPick(result.id);
    }

    return (
        <div className={cls.TorrentSearchResultRowContainer}>
            <Button variant="unstyled" className={cls.RowButton} onClick={handlePick} disabled={isDisabled}>
                <span className={cls.Title}>{title}</span>
                <span className={cls.Meta}>{formatTorrentSize(result.sizeBytes)}</span>
                <span className={cls.Meta}>{result.indexer}</span>
                <span className={cls.Meta}>{formatTorrentAge(result.publishedAt, new Date())}</span>
                {isLosslessTitle(title) && <span className={cls.LosslessBadge}>Lossless</span>}
                {result.isAlreadyImported && <span className={cls.ImportedMark}>Already imported</span>}
            </Button>
        </div>
    );
}
