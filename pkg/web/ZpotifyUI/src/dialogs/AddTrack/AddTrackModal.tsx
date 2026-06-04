import {useState} from 'react';
import {SongFile} from '@/app/api/zpotify';

import cls from '@/dialogs/AddTrack/AddTrackModal.module.css';

import {useDialog} from '@/app/hooks/Dialog.tsx';
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import {ServiceError} from "@/processes/Errors.ts";
import useUser from '@/hooks/user/User.ts';

import ChooseScreen from '@/dialogs/AddTrack/screens/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';

import {AudioFile} from '@/model/AudioFile.ts';

type ModalStep = 'choose' | 'drop' | 'library' | 'meta';

const DOT_STEPS: ModalStep[] = ['choose', 'drop', 'meta'];

const STEP_TITLES: Record<ModalStep, string> = {
    choose: 'add track(s)',
    drop: 'upload new track',
    library: 'pending uploads',
    meta: 'track details',
};

const BACK_STEPS: Partial<Record<ModalStep, ModalStep>> = {
    meta: 'drop',
    drop: 'choose',
    library: 'choose',
};

interface PanelHeaderProps {
    step: ModalStep;
    backStep: ModalStep | undefined;
    uploading: boolean;
    dotIndex: number;
    onBack: () => void;
    onClose: () => void;
}

function PanelHeader({step, backStep, uploading, dotIndex, onBack, onClose}: PanelHeaderProps) {
    return (
        <div className={cls.PanelHeader}>
            <div className={cls.HeaderLeft}>
                {backStep && !uploading && (
                    <button className={cls.BackButton} type="button" onClick={onBack}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 2L4 7l5 5"/>
                        </svg>
                    </button>
                )}
                <span className={cls.PanelTitle}>{STEP_TITLES[step]}</span>
            </div>

            <div className={cls.HeaderRight}>
                <div className={cls.StepDots}>
                    {DOT_STEPS.map((s, i) => (
                        <span
                            key={s}
                            className={
                                i === dotIndex ? cls.DotActive
                                : i < dotIndex ? cls.DotPast
                                : cls.DotFuture
                            }
                        />
                    ))}
                </div>
                <button className={cls.CloseButton} type="button" onClick={onClose}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="3" x2="13" y2="13"/>
                        <line x1="13" y1="3" x2="3" y2="13"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

function UploadingSpinner() {
    return (
        <div className={cls.UploadingState}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="16" cy="16" r="12" strokeOpacity="0.2"/>
                <path d="M16 4a12 12 0 0 1 12 12" className={cls.Spinner}/>
            </svg>
            <span>uploading…</span>
        </div>
    );
}

interface MetaStepProps {
    audioFile: AudioFile;
    title: string;
    onTitleChange: (t: string) => void;
    selectedArtists: string[];
    onArtistsChange: (a: string[]) => void;
    playlistId: string;
    onPlaylistChange: (id: string) => void;
    submitted: boolean;
    onSubmit: () => void;
}

function MetaStep({audioFile, title, onTitleChange, selectedArtists, onArtistsChange, playlistId, onPlaylistChange, submitted, onSubmit}: MetaStepProps) {
    return (
        <>
            <MetaScreen
                audioFile={audioFile}
                title={title}
                onTitleChange={onTitleChange}
                selectedArtists={selectedArtists}
                onArtistsChange={onArtistsChange}
                playlistId={playlistId}
                onPlaylistChange={onPlaylistChange}
            />
            <button
                className={`${cls.SubmitButton} ${submitted ? cls.ButtonSubmitted : cls.ButtonReady}`}
                type="button"
                onClick={onSubmit}
                disabled={submitted}
            >
                {submitted ? '✓ added' : 'add track'}
            </button>
        </>
    );
}

export default function AddTrackModal() {
    const {CloseDialog} = useDialog();
    const toaster = useToaster();
    const {Services} = useUser();

    const [step, setStep] = useState<ModalStep>('choose');
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [playlistId, setPlaylistId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function handleFile(f: File) {
        setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setUploadError(null);
        setUploading(true);
        Services().WebApi()
            .UploadFile(f)
            .then((id) => {
                setAudioFile(new AudioFile(id));
                setStep('meta');
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
        setAudioFile(new AudioFile(id));
        setTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setStep('meta');
    }

    function handleSubmit() {
        if (submitted || !audioFile?.fileId) return;
        setSubmitted(true);
        Services().Songs()
            .CreateSong(title, selectedArtists, audioFile.fileId)
            .then(() => setTimeout(() => { CloseDialog(); window.location.reload(); }, 1100))
            .catch((e) => {
                setSubmitted(false);
                toaster.catch(e);
            });
    }

    const backStep = BACK_STEPS[step];
    const dotIndex = step === 'library' ? 1 : DOT_STEPS.indexOf(step as 'choose' | 'drop' | 'meta');

    return (
        <div className={cls.Panel}>
            <PanelHeader
                step={step}
                backStep={backStep}
                uploading={uploading}
                dotIndex={dotIndex}
                onBack={() => setStep(backStep!)}
                onClose={CloseDialog}
            />

            <div className={cls.PanelBody}>
                {step === 'choose' && (
                    <ChooseScreen
                        onUploadNew={() => setStep('drop')}
                        onFromLibrary={() => setStep('library')}
                    />
                )}

                {step === 'library' && (
                    <PendingFilesScreen onSelect={handleSelectFromLibrary}/>
                )}

                {step === 'drop' && !uploading && (
                    <DropZoneScreen onFile={handleFile} uploadError={uploadError}/>
                )}
                {step === 'drop' && uploading && <UploadingSpinner/>}
                {step === 'meta' && audioFile?.fileId && (
                    <MetaStep
                        audioFile={audioFile}
                        title={title}
                        onTitleChange={setTitle}
                        selectedArtists={selectedArtists}
                        onArtistsChange={setSelectedArtists}
                        playlistId={playlistId}
                        onPlaylistChange={setPlaylistId}
                        submitted={submitted}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
}
