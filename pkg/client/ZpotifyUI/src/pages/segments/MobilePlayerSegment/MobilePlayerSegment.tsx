import { useEffect } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';

import cls from '@/pages/segments/MobilePlayerSegment/MobilePlayerSegment.module.css';
import { useMobilePlayerUI } from '@/shared/model/mobilePlayerUIStore.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import MobilePlayerProgress from '@/pages/segments/MobilePlayerSegment/components/MobilePlayerProgress/MobilePlayerProgress.tsx';
import MobilePlayerControls from '@/pages/segments/MobilePlayerSegment/components/MobilePlayerControls/MobilePlayerControls.tsx';

const DRAG_CLOSE_OFFSET = 120;
const DRAG_CLOSE_VELOCITY = 500;

export default function MobilePlayerSegment() {
    const isOpen = useMobilePlayerUI((state) => state.isOpen);
    const close = useMobilePlayerUI((state) => state.close);
    const audioPlayer = useAudioPlayer();

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ mobilePlayer: true }, '');

        function handlePopState() {
            close();
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen]);

    function handleRequestClose() {
        window.history.back();
    }

    function handleDragEnd(_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
        if (info.offset.y > DRAG_CLOSE_OFFSET || info.velocity.y > DRAG_CLOSE_VELOCITY) {
            handleRequestClose();
        }
    }

    return (
        <div className={cls.MobilePlayerContainer}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={cls.Sheet}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={handleDragEnd}
                    >
                        <div className={cls.DragHandle} onClick={handleRequestClose} />

                        <div className={cls.CoverInfoWrapper}>
                            {audioPlayer.songCover ? (
                                <img
                                    src={audioPlayer.songCover}
                                    alt={audioPlayer.songTitle ?? ''}
                                    className={cls.Cover}
                                />
                            ) : (
                                <div className={cls.CoverPlaceholder} />
                            )}

                            <div className={cls.TrackInfo}>
                                <span className={cls.SongTitle}>{audioPlayer.songTitle ?? 'nothing playing'}</span>
                                {audioPlayer.songArtist && (
                                    <span className={cls.SongArtist}>{audioPlayer.songArtist}</span>
                                )}
                            </div>
                        </div>

                        <div className={cls.ActionsWrapper}>
                            <MobilePlayerProgress />
                            <MobilePlayerControls />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
