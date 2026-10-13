import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/components/TorrentSearchLink/TorrentSearchLink.module.css';
import type { TorrentSearchStatus } from '@/app/api/zpotify';
import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';
import { WarningIcon } from '@/assets/icons/WarningIcon.tsx';
import { isTorrentSearchVisible, TORRENT_SEARCH_UNREACHABLE_HINT } from '@/shared/lib/torrentSearchStatus.ts';

interface Props {
    status: TorrentSearchStatus;
    label: string;
    onClick: () => void;
}

export default function TorrentSearchLink({ status, label, onClick }: Props) {
    if (!isTorrentSearchVisible(status)) return null;

    if (status === TORRENT_SEARCH_STATUSES.unreachable) {
        return (
            <span
                className={cn(cls.TorrentSearchLinkContainer, cls.IsUnreachable)}
                title={TORRENT_SEARCH_UNREACHABLE_HINT}
            >
                <Button variant="unstyled" className={cls.Link} disabled>
                    {label}
                </Button>
                <WarningIcon className={cls.WarningIcon} />
            </span>
        );
    }

    return (
        <span className={cls.TorrentSearchLinkContainer}>
            <Button variant="unstyled" className={cls.Link} onClick={onClick}>
                {label}
            </Button>
        </span>
    );
}
