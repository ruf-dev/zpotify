import cn from 'classnames';
import { useEffect, useState } from 'react';

import cls from '@/widgets/MusicPlayer/MusicPlayerWithLogo.module.scss';
import PlayerControls from '@/widgets/MusicPlayer/PlayerControls.tsx';
import AnimatedZ from '@/assets/AnimatedZ.tsx';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';
import TrackProgressControls from '@/widgets/MusicPlayer/buttons/TrackProgressControls.tsx';
import ShuffleTracksButton from '@/widgets/MusicPlayer/buttons/ShuffleTracksButton.tsx';

interface MusicPlayerProps {
    audioPlayer: AudioPlayer;
}

export default function MusicPlayerWithLogo({ audioPlayer }: MusicPlayerProps) {
    const [isOpened, setIsOpened] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (audioPlayer.isPlaying) {
            setIsOpened(true);
        }
    }, [audioPlayer.isPlaying]);

    return (
        <div
            className={cn(cls.Player, {
                [cls.open]: isOpened,
                [cls.playing]: audioPlayer.isPlaying,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(cls.Logo, { [cls.playing]: isOpened })} onClick={() => setIsOpened(!isOpened)}>
                <AnimatedZ />
            </div>

            {isOpened && (
                <div className={cls.Content}>
                    <div className={cls.TrackInfo}>
                        <div
                            className={cn(cls.TrackTitle, {
                                [cls.glowing]: audioPlayer.isPlaying && !!audioPlayer.songTitle,
                            })}
                        >
                            {audioPlayer.songTitle || 'nothing playing'}
                        </div>
                        {audioPlayer.songArtist && <div className={cls.TrackArtist}>{audioPlayer.songArtist}</div>}
                    </div>

                    <ShuffleTracksButton audioPlayer={audioPlayer} />
                    <PlayerControls audioPlayer={audioPlayer} />
                </div>
            )}

            <div
                className={cn(cls.TrackProgressControlsWrapper, {
                    [cls.open]: isOpened && audioPlayer.trackPath != null,
                })}
            >
                <TrackProgressControls audioPlayer={audioPlayer} isHovered={isHovered} />
            </div>
        </div>
    );
}
