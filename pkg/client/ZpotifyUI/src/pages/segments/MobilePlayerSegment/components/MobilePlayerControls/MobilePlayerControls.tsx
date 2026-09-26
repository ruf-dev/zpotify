import cn from 'classnames';

import cls from '@/pages/segments/MobilePlayerSegment/components/MobilePlayerControls/MobilePlayerControls.module.css';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';

export default function MobilePlayerControls() {
    const audioPlayer = useAudioPlayer();

    function handlePlayPrev() {
        audioPlayer.playPrev();
    }

    function handleTogglePlay() {
        audioPlayer.togglePlay();
    }

    function handlePlayNext() {
        audioPlayer.playNext();
    }

    return (
        <div className={cls.MobilePlayerControlsContainer}>
            <button className={cls.ControlButton} onClick={handlePlayPrev}>
                <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="2" height="12" />
                    <polygon points="11,1 3,7 11,13" />
                </svg>
            </button>

            <button
                className={cn(cls.PlayPauseButton, audioPlayer.isPlaying && cls.PlayPauseButtonPlaying)}
                onClick={handleTogglePlay}
            >
                {audioPlayer.isPlaying ? (
                    <svg
                        className={cls.PlayPauseIcon}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M3,2 h3 v10 H3 z" />
                        <path d="M9,2 h3 v10 H9 z" />
                    </svg>
                ) : (
                    <svg
                        className={cls.PlayPauseIcon}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M4,2 L14,7.5 L4,13 Z" />
                    </svg>
                )}
            </button>

            <button className={cls.ControlButton} onClick={handlePlayNext}>
                <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="11" y="1" width="2" height="12" />
                    <polygon points="3,1 11,7 3,13" />
                </svg>
            </button>
        </div>
    );
}
