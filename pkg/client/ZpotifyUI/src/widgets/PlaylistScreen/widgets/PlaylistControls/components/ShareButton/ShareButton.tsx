import IconButton from '@/components/IconButton/IconButton.tsx';
import { ShareIcon } from '@/assets/icons/ShareIcon.tsx';

export default function ShareButton() {
    return (
        <IconButton ariaLabel="Share">
            <ShareIcon />
        </IconButton>
    );
}
