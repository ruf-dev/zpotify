import cn from 'classnames';

import cls from '@/widgets/QueuePanel/QueuePanelWidget.module.css';
import { useQueuePanel } from '@/widgets/QueuePanel/useQueuePanel';

interface QueueTrack {
    id: number;
    title: string;
    artist: string;
    duration: string;
    color: string;
}

const QUEUE_TRACKS: QueueTrack[] = [
    { id: 1, title: 'Essence', artist: 'WizKid', duration: '3:42', color: '#d9007f' },
    { id: 2, title: 'Kiss Me More', artist: 'Doja Cat', duration: '3:33', color: '#0077e6' },
    { id: 3, title: 'Cellophane', artist: 'FKA Twigs', duration: '4:40', color: '#7400e6' },
    { id: 4, title: 'Gemini Feed', artist: 'Banks', duration: '3:51', color: '#00b36b' },
    { id: 5, title: 'Nights', artist: 'Frank Ocean', duration: '5:07', color: '#e64400' },
    { id: 6, title: 'IFHY', artist: 'Tyler', duration: '4:26', color: '#e6a800' },
    { id: 7, title: 'Distance', artist: 'Yebba', duration: '3:17', color: '#d9007f' },
    { id: 8, title: 'Motion Sickness', artist: 'Phoebe Bridgers', duration: '3:35', color: '#0077e6' },
];

export default function QueuePanelWidget() {
    const isOpen = useQueuePanel((s) => s.isOpen);
    const close = useQueuePanel((s) => s.close);

    function handleClose() {
        close();
    }

    return (
        <div className={cn(cls.QueuePanelContainer, !isOpen && cls.QueuePanelContainerClosed)}>
            <div className={cls.QueueHeader}>
                <span className={cls.QueueLabel}>Queue</span>
                <button className={cls.CloseButton} onClick={handleClose} type="button">
                    ×
                </button>
            </div>

            <div className={cls.QueueTrackList}>
                {QUEUE_TRACKS.map(function renderTrack(track, index) {
                    return (
                        <div key={track.id} className={cls.TrackRow}>
                            <span className={cls.TrackIndex}>
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div
                                className={cls.TrackCover}
                                style={{ background: track.color }}
                            />
                            <div className={cls.TrackInfo}>
                                <span className={cls.TrackTitle}>{track.title}</span>
                                <span className={cls.TrackArtist}>{track.artist}</span>
                            </div>
                            <span className={cls.TrackDuration}>{track.duration}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
