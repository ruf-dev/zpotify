import cls from '@/widgets/MusicPlayer/buttons/components/VolumeDisplay/VolumeDisplay.module.css';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';

interface VolumeDisplayProps {
    audioPlayer: AudioPlayer;
}

export default function VolumeDisplay({ audioPlayer }: VolumeDisplayProps) {
    return (
        <div
            className={cls.Display}
            style={{
                background: `
                    conic-gradient(${audioPlayer.isMuted ? '' : 'var(--accent-fg-color) ' + audioPlayer.volume + '%,'}
                     var(--disabled-fg-color) ${audioPlayer.volume}% 100%)`,
            }}
            onClick={audioPlayer.toggleMute}
        >
            <div className={cls.InnerRadius}>
                <div
                    style={{
                        fontSize: '70%',
                        color: '#333',
                        transition: 'all 0.5s ease',
                    }}
                >
                    {audioPlayer.isMuted ? 'M' : Math.round(audioPlayer.volume) + '%'}
                </div>
            </div>
        </div>
    );
}
