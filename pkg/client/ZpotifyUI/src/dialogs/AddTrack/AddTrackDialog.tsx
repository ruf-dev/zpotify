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

export type ModalStep = 'choose' | 'drop' | 'pending';

export interface AddTrackContext {
    goTo: (step: ModalStep) => void;
    uploading: boolean;
    uploadError: string | null;
    handleFiles: (files: File[]) => void;
    handleSelectFromLibrary: (song: SongFile) => void;
    handleCreatePlaylist: () => void;
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

export default function AddTrackDialog() {
    const { CloseDialog, OpenDialog } = useDialog();
    const toaster = useToaster();

    const [step, setStep] = useState<ModalStep>('choose');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

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

    function handleCreatePlaylist() {
        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} />);
    }

    function handleSelectFromLibrary(songFile: SongFile) {
        const id = songFile.id ?? '';
        const name = songFile.path?.split('/').pop() ?? '';
        const initialTitle = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        CloseDialog();
        OpenDialog(<MetaDialog audioFile={new AudioFile(id)} initialTitle={initialTitle} />);
    }

    const backStep = BACK_STEPS[step];

    const ctx: AddTrackContext = {
        goTo: setStep,
        uploading,
        uploadError,
        handleFiles,
        handleSelectFromLibrary,
        handleCreatePlaylist,
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
