import cls from '@/pages/main/search/Widget/TrackerSearchPromptWidget/TrackerSearchPromptWidget.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import AddTrackDialog from '@/dialogs/AddTrack/AddTrackDialog.tsx';
import useUser from '@/entities/user/useUser.ts';
import TorrentSearchLink from '@/components/TorrentSearchLink/TorrentSearchLink.tsx';
import { useTorrentSearchStatus } from '@/features/upload/useTorrentSearchStatus.ts';
import { isTorrentSearchVisible } from '@/shared/lib/torrentSearchStatus.ts';

interface Props {
    query: string;
}

export default function TrackerSearchPromptWidget({ query }: Props) {
    const canUpload = useUser((state) => state.userData?.permissions?.canUpload === true);
    const torrentSearchStatus = useTorrentSearchStatus();
    const { OpenDialog } = useDialog();

    function handleOpenTrackerSearch() {
        OpenDialog(<AddTrackDialog initialStep="search" initialSearchQuery={query} />);
    }

    if (!canUpload || !isTorrentSearchVisible(torrentSearchStatus)) return null;

    return (
        <div className={cls.TrackerSearchPromptWidgetContainer}>
            <span className={cls.Text}>Didn&apos;t find what you want?</span>
            <TorrentSearchLink
                status={torrentSearchStatus}
                label="Try search on trackers"
                onClick={handleOpenTrackerSearch}
            />
        </div>
    );
}
