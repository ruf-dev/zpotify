import IconButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.tsx';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';

export default function ShuffleButton() {
    return (
        <IconButton ariaLabel="Shuffle">
            <RandomArrows />
        </IconButton>
    );
}
