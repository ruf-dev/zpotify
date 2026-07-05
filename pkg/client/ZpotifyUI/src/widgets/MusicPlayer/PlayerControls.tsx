import { JSX } from 'react';

import PlayPauseButton from '@/widgets/MusicPlayer/buttons/PlayPauseButton.tsx';
import TrackRewindButton from '@/widgets/MusicPlayer/buttons/TrackRewindButton.tsx';
import cls from '@/widgets/MusicPlayer/PlayerControls.module.css';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';

export interface PlayerProps {
    audioPlayer: AudioPlayer;
}

export default function PlayerControls({ audioPlayer }: PlayerProps): JSX.Element {
    return (
        <div className={cls.PlayerControlsContainer}>
            <TrackRewindButton
                onClick={() => audioPlayer.playPrev()}
                isDisabled={audioPlayer.trackPath == null}
                previous
            />
            <PlayPauseButton
                isPlaying={audioPlayer.isPlaying}
                isDisabled={audioPlayer.trackPath == null}
                onClick={() => audioPlayer.togglePlay()}
            />
            <TrackRewindButton onClick={() => audioPlayer.playNext()} isDisabled={audioPlayer.trackPath == null} next />
        </div>
    );
}
