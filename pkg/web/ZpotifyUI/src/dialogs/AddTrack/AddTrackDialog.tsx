import { useState, type ComponentType } from 'react';

import type { SongFile } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/AddTrackDialog.module.css';
import CloseButton from '@/shared/ui/CloseButton';
import StepDots from '@/shared/ui/StepDots';
import BackButton from '@/shared/ui/BackButton';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import ChooseScreen from '@/dialogs/AddTrack/screens/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';
import { MultitrackUploadDialog } from '@/dialogs/MultitrackUpload';
import MetaDialog from '@/dialogs/Meta/MetaDialog';
import { AudioFile } from '@/shared/model/AudioFile.ts';

export type ModalStep = 'choose' | 'drop' | 'pending';

export interface AddTrackContext {
    goTo: (step: ModalStep) => void;
    uploading: boolean;
    uploadError: string | null;
    handleFiles: (files: File[]) => void;
    handleSelectFromLibrary: (song: SongFile) => void;
}

const DOT_STEPS: ModalStep[] = ['choose', 'drop'];

const STEP_TITLES: Record<ModalStep, string> = {
    choose: 'add track(s)',
    drop: 'upload new track',
    pending: 'pending uploads',
};

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

    function handleFiles(files: File[]) {
        if (files.length > 1) {
            CloseDialog();
            OpenDialog(<MultitrackUploadDialog files={files} />);
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

interface PanelHeaderProps {
    step: ModalStep;
    backStep: ModalStep | undefined;
    uploading: boolean;
    onBack: () => void;
    onClose: () => void;
}

function PanelHeader({ step, backStep, uploading, onBack, onClose }: PanelHeaderProps) {
    return (
        <div className={cls.PanelHeader}>
            <div className={cls.HeaderLeft}>
                {backStep && !uploading && <BackButton onClick={onBack} />}
                <span className={cls.PanelTitle}>{STEP_TITLES[step]}</span>
            </div>

            <div className={cls.HeaderRight}>
                <StepDots steps={DOT_STEPS} currentStep={step} />

                <CloseButton onClick={onClose} />
            </div>
        </div>
    );
}
