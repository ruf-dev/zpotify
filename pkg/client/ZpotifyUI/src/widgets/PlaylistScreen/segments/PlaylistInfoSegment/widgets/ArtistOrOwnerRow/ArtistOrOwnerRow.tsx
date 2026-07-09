import EditableArtistPicker from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import type { EditableArtistPickerContext } from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import PlaylistOwnerLabel from '@/widgets/PlaylistScreen/components/PlaylistOwnerLabel/PlaylistOwnerLabel.tsx';
import type { PlaylistOwnerLabelProps } from '@/widgets/PlaylistScreen/components/PlaylistOwnerLabel/PlaylistOwnerLabel.tsx';

export interface ArtistOrOwnerRowProps {
    playlistIsAlbum: boolean;
    artistPicker: EditableArtistPickerContext;
    ownerLabelProps: PlaylistOwnerLabelProps;
}

export default function ArtistOrOwnerRow({ playlistIsAlbum, artistPicker, ownerLabelProps }: ArtistOrOwnerRowProps) {
    return playlistIsAlbum ? <EditableArtistPicker {...artistPicker} /> : <PlaylistOwnerLabel {...ownerLabelProps} />;
}
