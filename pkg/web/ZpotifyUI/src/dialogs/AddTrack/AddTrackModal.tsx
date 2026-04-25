import {useState} from 'react';
import {useDialog} from '@/app/hooks/Dialog.tsx';
import ChooseScreen from '@/dialogs/AddTrack/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/DropZoneScreen';
import MetaScreen from '@/dialogs/AddTrack/MetaScreen';
import cls from '@/dialogs/AddTrack/AddTrackModal.module.css';

type ModalStep = 'choose' | 'drop' | 'meta';

interface Playlist {
    id: string;
    name: string;
    count: number;
}

interface AddTrackModalProps {
    playlists: Playlist[];
    artistOptions: string[];
}

const STEPS: ModalStep[] = ['choose', 'drop', 'meta'];

const STEP_TITLES: Record<ModalStep, string> = {
    choose: 'add track(s)',
    drop: 'upload new track',
    meta: 'track details',
};

const BACK_STEPS: Partial<Record<ModalStep, ModalStep>> = {
    meta: 'drop',
    drop: 'choose',
};

export default function AddTrackModal({playlists, artistOptions}: AddTrackModalProps) {
    const {CloseDialog} = useDialog();
    const [step, setStep] = useState<ModalStep>('choose');
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [playlistId, setPlaylistId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleFile = (f: File) => {
        setFile(f);
        setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setStep('meta');
    };

    const handleSubmit = () => {
        if (!playlistId || submitted) return;
        setSubmitted(true);
        setTimeout(() => CloseDialog(), 1100);
    };

    const backStep = BACK_STEPS[step];
    const stepIndex = STEPS.indexOf(step);

    return (
        <div className={cls.Panel}>
            <div className={cls.PanelHeader}>
                <div className={cls.HeaderLeft}>
                    {backStep && (
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
                        {STEPS.map((s, i) => (
                            <span
                                key={s}
                                className={
                                    i === stepIndex ? cls.DotActive
                                    : i < stepIndex ? cls.DotPast
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
                    <ChooseScreen onUploadNew={() => setStep('drop')}/>
                )}
                {step === 'drop' && (
                    <DropZoneScreen onFile={handleFile}/>
                )}
                {step === 'meta' && file && (
                    <MetaScreen
                        file={file}
                        title={title}
                        onTitleChange={setTitle}
                        selectedArtists={selectedArtists}
                        onArtistsChange={setSelectedArtists}
                        artistOptions={artistOptions}
                        playlistId={playlistId}
                        onPlaylistChange={setPlaylistId}
                        playlists={playlists}
                        submitted={submitted}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
}
