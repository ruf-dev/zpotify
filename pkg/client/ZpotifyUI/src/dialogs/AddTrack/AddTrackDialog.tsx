import { useState, type ComponentType } from 'react';

import type { SongFile } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/AddTrackDialog.module.css';
import PanelHeader from '@/dialogs/AddTrack/components/PanelHeader/PanelHeader';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import ChooseScreen from '@/dialogs/AddTrack/screens/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';
import MultitrackUploadModal from '@/dialogs/MultitrackUpload/MultitrackUploadModal';
import MetaDialog from '@/dialogs/Meta/MetaDialog';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import { isSupportedAudioFile } from '@/features/upload/supportedAudio.ts';
import type { DroppedGroups } from '@/features/upload/resolveDroppedEntries.ts';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { useBatchUpload } from '@/dialogs/AddTrack/useBatchUpload';
import { useBackGuard } from '@/shared/lib/useBackGuard';

export type ModalStep = 'choose' | 'drop' | 'pending';

export interface AddTrackContext {
    goTo: (step: ModalStep) => void;
    uploading: boolean;
    uploadError: string | null;
    handleFiles: (files: File[]) => void;
    handleSelectFromLibrary: (song: SongFile) => void;
    handleCreatePlaylist: () => void;
    handleDroppedGroups: (groups: DroppedGroups) => void;
    batchTracks: TrackDraft[];
    handleOpenBatchFolder: (folderName: string) => void;
}

const BACK_STEPS: Partial<Record<ModalStep, ModalStep>> = {
    drop: 'choose',
    pending: 'choose',
};

const SCREENS: Record<ModalStep, ComponentType<AddTrackContext>> = {
    choose: ChooseScreen,
    drop: DropZoneScreen,
    pending: PendingFilesScreen,
};

interface AddTrackDialogProps {
    initialStep?: ModalStep;
}

export default function AddTrackDialog({ initialStep = 'choose' }: AddTrackDialogProps) {
    const { CloseDialog, OpenDialog } = useDialog();
    const toaster = useToaster();

    const [step, setStep] = useState<ModalStep>(initialStep);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const batchUpload = useBatchUpload();
    const backStep = BACK_STEPS[step];

    useBackGuard(!!backStep, () => setStep(backStep!));

    function handleFiles(rawFiles: File[]) {
        const files = rawFiles.filter(isSupportedAudioFile);
        const rejected = rawFiles.filter((f) => !isSupportedAudioFile(f));
        if (rejected.length > 0) {
            toaster.bake({
                title: 'unsupported format',
                description: `only mp3, flac and aac are supported: ${rejected.map((f) => f.name).join(', ')}`,
                level: 'Warn',
                isDismissable: true,
            });
        }
        if (files.length === 0) return;

        if (files.length > 1) {
            CloseDialog();
            OpenDialog(<MultitrackUploadModal files={files} />);
            return;
        }

        const f = files[0];
        const initialTitle = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadError(null);
        setUploading(true);
        webApiService
            .UploadFile(f)
            .then((id) => {
                CloseDialog();
                OpenDialog(<MetaDialog audioFile={new AudioFile(id)} initialTitle={initialTitle} />);
            })
            .catch((err: unknown) => {
                if (err instanceof ServiceError && err.statusCode === 429) {
                    setUploadError('upload limit reached — remove a pending track first');
                } else {
                    toaster.catch(err as ServiceError);
                }
            })
            .finally(() => setUploading(false));
    }

    function handleDroppedGroups(groups: DroppedGroups) {
        const soleFolder =
            groups.folders.length === 1 && groups.looseFiles.length === 0 ? groups.folders[0] : undefined;

        if (soleFolder) {
            CloseDialog();
            OpenDialog(
                <MultitrackUploadModal files={[]} folders={[soleFolder]} initialPlaylistName={soleFolder.name} />,
            );
            return;
        }

        batchUpload.startBatch(groups.folders, groups.looseFiles);
        setStep('pending');
    }

    function handleOpenBatchFolder(folderName: string) {
        const folder = batchUpload.folders.find((f) => f.name === folderName);
        if (!folder) return;

        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} folders={[folder]} initialPlaylistName={folder.name} />);
    }

    function handleCreatePlaylist() {
        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} />);
    }

    function handleSelectFromLibrary(songFile: SongFile) {
        const id = songFile.id ?? '';
        const name = songFile.path?.split('/').pop() ?? '';
        const initialTitle = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        OpenDialog(
            <MetaDialog
                audioFile={new AudioFile(id)}
                initialTitle={initialTitle}
                previousScreen={<AddTrackDialog initialStep="pending" />}
            />,
        );
    }

    const ctx: AddTrackContext = {
        goTo: setStep,
        uploading,
        uploadError,
        handleFiles,
        handleSelectFromLibrary,
        handleCreatePlaylist,
        handleDroppedGroups,
        batchTracks: batchUpload.tracks,
        handleOpenBatchFolder,
    };

    const Screen = SCREENS[step];

    return (
        <div className={cls.AddTrackContainer}>
            <PanelHeader
                step={step}
                backStep={backStep}
                uploading={uploading}
                onBack={() => setStep(backStep!)}
                onClose={CloseDialog}
            />

            <div className={cls.PanelBody}>
                <Screen {...ctx} />
            </div>
        </div>
    );
}
