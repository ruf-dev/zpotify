import type { Playlist, SongBase } from '@/app/api/zpotify';
import ShuffleButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShuffleButton/ShuffleButton.tsx';
import ShareButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/ShareButton/ShareButton.tsx';
import SaveButtonWidget from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/SaveButtonWidget/SaveButtonWidget.tsx';
import DownloadButtonWidget from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/DownloadButtonWidget/DownloadButtonWidget.tsx';

export interface InfoControlsProps {
    playlist: Playlist;
    songs: SongBase[];
}

export default function InfoControls({ playlist, songs }: InfoControlsProps) {
    return (
        <>
            <ShuffleButton />

            <SaveButtonWidget uuid={playlist.uuid ?? ''} isSaved={playlist.isSaved ?? false} />

            <ShareButton />

            <DownloadButtonWidget playlist={playlist} songs={songs} />
        </>
    );
}
