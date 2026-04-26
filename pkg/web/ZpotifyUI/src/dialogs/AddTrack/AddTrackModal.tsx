import {useState} from 'react';
import {SongFile} from '@/app/api/zpotify';

import cls from '@/dialogs/AddTrack/AddTrackModal.module.css';

import {useDialog} from '@/app/hooks/Dialog.tsx';
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";

import ChooseScreen from '@/dialogs/AddTrack/screens/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import MetaScreen from '@/dialogs/shared/screens/MetaScreen';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';

import {Services} from '@/hooks/user/User.ts';
import {AudioFile} from '@/model/AudioFile.ts';

type ModalStep = 'choose' | 'drop' | 'library' | 'meta';

interface AddTrackModalProps {
    services: Services;
}

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

export default function AddTrackModal({services}: AddTrackModalProps) {
    const {CloseDialog} = useDialog();
    const toaster = useToaster();

    const [step, setStep] = useState<ModalStep>('choose');
    const [file, setFile] = useState<File | null>(null);

    const [fileId, setFileId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [playlistId, setPlaylistId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleFile = (f: File) => {
        setFile(f);
        setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setUploading(true);
        const audioFile = new AudioFile(f);
        services.WebApi()
            .UploadFile(audioFile)
            .then((id) => {
                setFileId(id);
                setStep('meta');
            })
            .catch(toaster.catch)
            .finally(() => setUploading(false));
    };

    const handleSelectFromLibrary = (songFile: SongFile) => {
        const id = songFile.id ?? '';
        const name = songFile.path?.split('/').pop() ?? '';
        setFileId(id);
        setFile(null);
        setTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setStep('meta');
    };

    const handleSubmit = () => {
        if (submitted || !fileId) return;
        setSubmitted(true);
        services.Songs()
            .CreateSong(title, selectedArtists, fileId)
            .then(() => setTimeout(() => { CloseDialog(); window.location.reload(); }, 1100))
            .catch((e) => {
                setSubmitted(false);
                toaster.catch(e);
            });
    };

    const backStep = BACK_STEPS[step];
    const dotIndex = step === 'library' ? 1 : DOT_STEPS.indexOf(step as 'choose' | 'drop' | 'meta');

    return (
        <div className={cls.Panel}>
            <div className={cls.PanelHeader}>
                <div className={cls.HeaderLeft}>
                    {backStep && !uploading && (
                        <button className={cls.BackButton} type="button" onClick={() => setStep(backStep)}>
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
                    <button className={cls.CloseButton} type="button" onClick={CloseDialog}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="3" x2="13" y2="13"/>
                            <line x1="13" y1="3" x2="3" y2="13"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className={cls.PanelBody}>
                {step === 'choose' && (
                    <ChooseScreen
                        onUploadNew={() => setStep('drop')}
                        onFromLibrary={() => setStep('library')}
                        fileService={services.File()}
                    />
                )}
                {step === 'library' && (
                    <PendingFilesScreen
                        fileService={services.File()}
                        onSelect={handleSelectFromLibrary}
                    />
                )}
                {step === 'drop' && !uploading && (
                    <DropZoneScreen onFile={handleFile}/>
                )}
                {step === 'drop' && uploading && (
                    <div className={cls.UploadingState}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="16" cy="16" r="12" strokeOpacity="0.2"/>
                            <path d="M16 4a12 12 0 0 1 12 12" className={cls.Spinner}/>
                        </svg>
                        <span>uploading…</span>
                    </div>
                )}
                {step === 'meta' && fileId && (
                    <>
                        <MetaScreen
                            file={file}
                            fileId={fileId}
                            fileService={services.File()}
                            artistsService={services.Artists()}
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
                    </>
                )}
            </div>
        </div>
    );
}