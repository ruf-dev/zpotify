import { CreatePlaylistIcon } from '@/assets/icons/CreatePlaylistIcon';
import cls from '@/dialogs/AddTrack/screens/components/CreatePlaylistCard/CreatePlaylistCard.module.css';

interface CreatePlaylistCardProps {
    onClick: () => void;
}

export default function CreatePlaylistCard({ onClick }: CreatePlaylistCardProps) {
    return (
        <div className={cls.CreatePlaylistCardContainer} onClick={onClick}>
            <div className={cls.IconCircle}>
                <CreatePlaylistIcon />
            </div>
            <div className={cls.CardText}>
                <span className={cls.CardTitle}>Create playlist</span>
                <span className={cls.CardSubtitle}>start an empty playlist and add tracks</span>
            </div>
        </div>
    );
}
