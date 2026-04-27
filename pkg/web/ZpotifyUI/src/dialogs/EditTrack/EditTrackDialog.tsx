import {useState} from 'react';
import {SongBase} from '@/app/api/zpotify';

import cls from '@/dialogs/EditTrack/EditTrackDialog.module.css';

import {useDialog} from '@/app/hooks/Dialog.tsx';
import {Services} from '@/hooks/user/User.ts';

import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";

interface EditTrackDialogProps {
    song: SongBase;
    services: Services;
}

export default function EditTrackDialog({song, services}: EditTrackDialogProps) {
    const {CloseDialog} = useDialog();
    const toaster = useToaster();
    const [title, setTitle] = useState(song.title ?? '');
    const [selectedArtists, setSelectedArtists] = useState<string[]>(
        (song.artists ?? []).filter(a => a.uuid).map(a => a.uuid!)
    );
    const [playlistId, setPlaylistId] = useState('');

    const handleSave = () => {
        services.Songs()
            .UpdateSong(song.id ?? '', title, selectedArtists)
            .then(CloseDialog)
            .catch(toaster.catch);
    };

    return (
        <div className={cls.Panel}>
            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>edit track</span>
                <button className={cls.CloseButton} type="button" onClick={CloseDialog}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round">
                        <line x1="3" y1="3" x2="13" y2="13"/>
                        <line x1="13" y1="3" x2="3" y2="13"/>
                    </svg>
                </button>
            </div>

            <div className={cls.PanelBody}>
                <MetaScreen
                    fileService={services.File()}
                    artistsService={services.Artists()}
                    durationSec={song.durationSec}
                    title={title}
                    onTitleChange={setTitle}
                    selectedArtists={selectedArtists}
                    onArtistsChange={setSelectedArtists}
                    playlistId={playlistId}
                    onPlaylistChange={setPlaylistId}
                />
                <button
                    className={`${cls.SubmitButton} ${cls.ButtonReady}`}
                    type="button"
                    onClick={handleSave}
                >
                    save
                </button>
            </div>
        </div>
    );
}
