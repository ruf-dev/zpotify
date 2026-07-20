import { useState } from 'react';
import cn from 'classnames';
import { ModalActions, ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/Meta/MetaDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { songsService } from '@/shared/api/Songs.ts';
import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { useFeedRefresh } from '@/entities/feed/useFeedRefresh.ts';

interface MetaDialogProps {
    audioFile: AudioFile;
    initialTitle: string;
}

export default function MetaDialog({ audioFile, initialTitle }: MetaDialogProps) {
    const { CloseDialog } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);
    const bumpFeed = useFeedRefresh((s) => s.bump);

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
                    bumpFeed();
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
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
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
                <ModalActions
                    buttons={[
                        {
                            label: submitted ? '✓ added' : 'add track',
                            onClick: handleSubmit,
                            className: cn(cls.SubmitButton, submitted ? cls.ButtonSubmitted : cls.ButtonReady),
                            disabled: submitted,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
