import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/widgets/PlaylistMetaRow/PlaylistMetaRow.module.css';
import EditableYear from '@/widgets/PlaylistScreen/components/EditableYear/EditableYear.tsx';
import type { EditableYearProps } from '@/widgets/PlaylistScreen/components/EditableYear/EditableYear.tsx';
import TrackCountLabel from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.tsx';
import type { TrackCountLabelProps } from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.tsx';

export interface PlaylistMetaRowProps {
    showYear: boolean;
    yearProps: EditableYearProps;
    trackCountProps: TrackCountLabelProps;
}

export default function PlaylistMetaRow({ showYear, yearProps, trackCountProps }: PlaylistMetaRowProps) {
    return (
        <div className={cls.MetaRow}>
            {showYear && <EditableYear {...yearProps} />}
            <TrackCountLabel {...trackCountProps} />
        </div>
    );
}
