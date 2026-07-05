import { useEffect, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import cls from '@/dialogs/EditTrack/EditTrackDialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { songsService } from '@/shared/api/Songs.ts';
import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { Option } from '@/shared/ui/MultiSelect.tsx';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';

interface EditTrackDialogProps {
    song: SongBase;
}

export default function EditTrackDialog({ song }: EditTrackDialogProps) {
    const { CloseDialog } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);

    const [title, setTitle] = useState(song.title ?? '');
    const [selectedArtists, setSelectedArtists] = useState<string[]>(
        (song.artists ?? []).filter((a) => a.uuid).map((a) => a.uuid!),
    );
    const [initialArtistOptions, setInitialArtistOptions] = useState<Option[]>(
        (song.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, label: a.name! })),
    );
    const [playlistId, setPlaylistId] = useState('');
    const [audioFile, setAudioFile] = useState(new AudioFile(undefined, song.durationSec));

    useEffect(() => {
        songsService
            .GetSong(song.id ?? '')
            .then((s) => {
                const opts = (s.artists ?? [])
                    .filter((a) => a.uuid && a.name)
                    .map((a) => ({ id: a.uuid!, label: a.name! }));
                setInitialArtistOptions(opts);
                setSelectedArtists((s.artists ?? []).filter((a) => a.uuid).map((a) => a.uuid!));
                setAudioFile(new AudioFile(s.fileId, s.durationSec));
            })
            .catch(toaster.catch);
    }, []);

    function handleSave() {
        songsService
            .UpdateSong(song.id ?? '', title, selectedArtists)
            .then(() => {
                CloseDialog();
                refreshActive();
            })
            .catch(toaster.catch);
    }

    return (
        <div className={cls.EditTrackContainer}>
            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>edit track</span>
                <button className={cls.CloseButton} type="button" onClick={CloseDialog}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="3" y1="3" x2="13" y2="13" />
                        <line x1="13" y1="3" x2="3" y2="13" />
                    </svg>
                </button>
            </div>

            <div className={cls.PanelBody}>
                <MetaScreen
                    audioFile={audioFile}
                    title={title}
                    onTitleChange={setTitle}
                    selectedArtists={selectedArtists}
                    onArtistsChange={setSelectedArtists}
                    playlistId={playlistId}
                    onPlaylistChange={setPlaylistId}
                    initialArtistOptions={initialArtistOptions}
                />
                <button className={`${cls.SubmitButton} ${cls.ButtonReady}`} type="button" onClick={handleSave}>
                    save
                </button>
            </div>
        </div>
    );
}
