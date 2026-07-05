import { useState } from 'react';

import cls from '@/dialogs/Meta/MetaDialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { songsService } from '@/shared/api/Songs.ts';
import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';

interface MetaDialogProps {
    audioFile: AudioFile;
    initialTitle: string;
}

export default function MetaDialog({ audioFile, initialTitle }: MetaDialogProps) {
    const { CloseDialog } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);

    const [title, setTitle] = useState(initialTitle);
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [playlistId, setPlaylistId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit() {
        if (submitted || !audioFile.fileId) return;
        setSubmitted(true);
        songsService
            .CreateSong(title, selectedArtists, audioFile.fileId)
            .then(() =>
                setTimeout(() => {
                    CloseDialog();
                    refreshActive();
                }, 1100),
            )
            .catch((e) => {
                setSubmitted(false);
                toaster.catch(e);
            });
    }

    return (
        <div className={cls.MetaDialogContainer}>
            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>track details</span>
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
                />
                <button
                    className={`${cls.SubmitButton} ${submitted ? cls.ButtonSubmitted : cls.ButtonReady}`}
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitted}
                >
                    {submitted ? '✓ added' : 'add track'}
                </button>
            </div>
        </div>
    );
}
