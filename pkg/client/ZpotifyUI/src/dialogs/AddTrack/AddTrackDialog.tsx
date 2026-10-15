import { useEffect, useRef, useState, type ComponentType } from 'react';

import type { SongFile, TorrentJob, TorrentSearchResult } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/AddTrackDialog.module.css';
import PanelHeader from '@/dialogs/AddTrack/components/PanelHeader/PanelHeader';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { parseDuplicateTorrentJobId } from '@/dialogs/AddTrack/parseDuplicateTorrentJobId.ts';
import ChooseScreen from '@/dialogs/AddTrack/screens/ChooseScreen';
import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import SearchScreen from '@/dialogs/AddTrack/screens/SearchScreen';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';
import TorrentFilesScreen from '@/dialogs/AddTrack/screens/TorrentFilesScreen';
import MultitrackUploadModal from '@/dialogs/MultitrackUpload/MultitrackUploadModal';
import MetaDialog from '@/dialogs/Meta/MetaDialog';
import TorrentManageDialog from '@/dialogs/TorrentManage/TorrentManageDialog';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import type { DroppedGroups } from '@/features/upload/resolveDroppedEntries.ts';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { useBatchUpload } from '@/dialogs/AddTrack/useBatchUpload';
import { useBackGuard } from '@/shared/lib/useBackGuard';

export type ModalStep = 'choose' | 'drop' | 'pending' | 'torrentFiles' | 'search';

export interface AddTrackContext {
    goTo: (step: ModalStep) => void;
    uploading: boolean;
    uploadError: string | null;
    handleFiles: (files: File[]) => void;
    handleTorrentFile: (file: File) => void;
    handleSelectFromLibrary: (song: SongFile) => void;
    handleManageTorrent: (job: TorrentJob) => void;
    handleCreatePlaylist: () => void;
    handleCreatePlaylistFromFolder: (folderName: string, files: SongFile[]) => void;
    handleCreatePlaylistFromFiles: (files: SongFile[]) => void;
    handleCreateSingle: (file: SongFile) => void;
    handleDroppedGroups: (groups: DroppedGroups) => void;
    batchTracks: TrackDraft[];
    handleOpenBatchFolder: (folderName: string) => void;
    pendingTorrentUpload: { id: string; folderName: string } | null;
    submittingTorrentFile: boolean;
    handleSubmitTorrentFile: (selectedPaths: string[], torrentName: string) => void;
    handleMagnetLink: (magnetUri: string) => void;
    handleTorrentSearchResult: (result: TorrentSearchResult) => void;
    discardPendingTorrentUpload: () => void;
    pickedTorrentTitle: string;
    searchQuery: string;
    handleSearch: (query: string) => void;
    goBack: () => void;
}

const BACK_STEPS: Partial<Record<ModalStep, ModalStep>> = {
    drop: 'choose',
    pending: 'choose',
    search: 'choose',
};

const SCREENS: Record<ModalStep, ComponentType<AddTrackContext>> = {
    choose: ChooseScreen,
    drop: DropZoneScreen,
    pending: PendingFilesScreen,
    torrentFiles: TorrentFilesScreen,
    search: SearchScreen,
};

interface AddTrackDialogProps {
    initialStep?: ModalStep;
    initialMagnet?: string;
    initialSearchQuery?: string;
}

export default function AddTrackDialog({
    initialStep = 'choose',
    initialMagnet,
    initialSearchQuery,
}: AddTrackDialogProps) {
    const { CloseDialog, OpenDialog } = useDialog();
    const toaster = useToaster();

    const [step, setStep] = useState<ModalStep>(initialStep);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [pendingTorrentUpload, setPendingTorrentUpload] = useState<{ id: string; folderName: string } | null>(null);
    const [submittingTorrentFile, setSubmittingTorrentFile] = useState(false);
    const pendingTorrentUploadRef = useRef(pendingTorrentUpload);
    pendingTorrentUploadRef.current = pendingTorrentUpload;
    const batchUpload = useBatchUpload();
    const [searchQuery, setSearchQuery] = useState((initialSearchQuery ?? '').trim());
    const [torrentFilesOrigin, setTorrentFilesOrigin] = useState<ModalStep>('choose');
    const [pickedTorrentTitle, setPickedTorrentTitle] = useState('');
    const addTorrentRequestRef = useRef(0);
    const backStep = step === 'torrentFiles' ? torrentFilesOrigin : BACK_STEPS[step];
    const isInitialMagnetHandledRef = useRef(false);

    useBackGuard(!!backStep, handleBack);

    useEffect(() => {
        return () => {
            const pending = pendingTorrentUploadRef.current;
            if (pending) torrentService.DiscardTorrentFile({ id: pending.id }).catch(() => undefined);
        };
    }, []);

    useEffect(() => {
        if (!initialMagnet || isInitialMagnetHandledRef.current) return;

        isInitialMagnetHandledRef.current = true;
        handleMagnetLink(initialMagnet);
    }, []);

    function discardPendingTorrentUpload() {
        const pending = pendingTorrentUploadRef.current;
        if (!pending) return;

        pendingTorrentUploadRef.current = null;
        torrentService.DiscardTorrentFile({ id: pending.id }).catch(() => undefined);
        setPendingTorrentUpload(null);
    }

    function handleBack() {
        addTorrentRequestRef.current += 1;
        if (step === 'torrentFiles') setUploading(false);
        discardPendingTorrentUpload();
        setStep(backStep!);
    }

    function handleFiles(files: File[]) {
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

    function handleTorrentFile(file: File) {
        const folderName = file.name.replace(/\.torrent$/i, '');
        setTorrentFilesOrigin('choose');
        setPickedTorrentTitle('');
        setUploadError(null);
        setUploading(true);
        webApiService
            .UploadTorrent(file)
            .then((res) => {
                setPendingTorrentUpload({ id: res.id, folderName });
                setStep('torrentFiles');
            })
            .catch((err: unknown) => {
                const existingJobId = parseDuplicateTorrentJobId(err);
                if (existingJobId === undefined) {
                    toaster.catch(err as ServiceError);
                    return;
                }

                openExistingTorrentJob(existingJobId);
            })
            .finally(() => setUploading(false));
    }

    function handleTorrentAddResult(res: { uploadId?: string; existingJobId?: string }) {
        if (res.existingJobId) {
            openExistingTorrentJob(res.existingJobId);
            return;
        }
        if (!res.uploadId) return;

        setPendingTorrentUpload({ id: res.uploadId, folderName: '' });
        setStep('torrentFiles');
    }

    function handleMagnetLink(magnetUri: string) {
        setTorrentFilesOrigin('choose');
        setPickedTorrentTitle('');
        setUploadError(null);
        setUploading(true);
        torrentService
            .AddTorrentMagnet({ magnetUri })
            .then(handleTorrentAddResult)
            .catch((err: unknown) => toaster.catch(err as ServiceError))
            .finally(() => setUploading(false));
    }

    function handleTorrentSearchResult(result: TorrentSearchResult) {
        if (!result.id) return;

        addTorrentRequestRef.current += 1;
        const requestNumber = addTorrentRequestRef.current;
        setUploadError(null);
        setTorrentFilesOrigin('search');
        setPickedTorrentTitle(result.title ?? '');
        setUploading(true);
        setStep('torrentFiles');
        torrentService
            .AddTorrentSearchResult({ id: result.id })
            .then((res) => {
                if (requestNumber !== addTorrentRequestRef.current) {
                    if (res.uploadId) torrentService.DiscardTorrentFile({ id: res.uploadId }).catch(() => undefined);
                    return;
                }
                if (!res.uploadId) setStep('search');
                handleTorrentAddResult(res);
            })
            .catch((err: unknown) => {
                if (requestNumber !== addTorrentRequestRef.current) return;

                toaster.catch(err as ServiceError);
                setStep('search');
            })
            .finally(() => {
                if (requestNumber === addTorrentRequestRef.current) setUploading(false);
            });
    }

    function handleSubmitTorrentFile(selectedPaths: string[], torrentName: string) {
        if (!pendingTorrentUpload) return;

        setSubmittingTorrentFile(true);
        torrentService
            .SubmitTorrentFile({
                id: pendingTorrentUpload.id,
                folderName: pendingTorrentUpload.folderName || torrentName,
                selectedPaths,
            })
            .then(() => {
                setPendingTorrentUpload(null);
                setStep('pending');
            })
            .catch((err: unknown) => {
                const existingJobId = parseDuplicateTorrentJobId(err);
                if (existingJobId === undefined) {
                    toaster.catch(err as ServiceError);
                    return;
                }

                setPendingTorrentUpload(null);
                openExistingTorrentJob(existingJobId);
            })
            .finally(() => setSubmittingTorrentFile(false));
    }

    function openExistingTorrentJob(jobId: string) {
        torrentService
            .GetTorrentJob({ jobId })
            .then((res) => {
                if (!res.job) return;
                OpenDialog(<TorrentManageDialog job={res.job} />);
            })
            .catch((err: unknown) => toaster.catch(err as ServiceError));
    }

    function handleManageTorrent(job: TorrentJob) {
        OpenDialog(<TorrentManageDialog job={job} previousScreen={<AddTrackDialog initialStep="pending" />} />);
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

    function handleCreatePlaylistFromFolder(folderName: string, files: SongFile[]) {
        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} existingFiles={files} initialPlaylistName={folderName} />);
    }

    function handleCreatePlaylistFromFiles(files: SongFile[]) {
        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} existingFiles={files} />);
    }

    function handleCreateSingle(file: SongFile) {
        CloseDialog();
        OpenDialog(<MultitrackUploadModal files={[]} existingFiles={[file]} isSingle />);
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
        handleTorrentFile,
        handleSelectFromLibrary,
        handleManageTorrent,
        handleCreatePlaylist,
        handleCreatePlaylistFromFolder,
        handleCreatePlaylistFromFiles,
        handleCreateSingle,
        handleDroppedGroups,
        batchTracks: batchUpload.tracks,
        handleOpenBatchFolder,
        pendingTorrentUpload,
        submittingTorrentFile,
        handleSubmitTorrentFile,
        handleMagnetLink,
        handleTorrentSearchResult,
        discardPendingTorrentUpload,
        pickedTorrentTitle,
        searchQuery,
        handleSearch: setSearchQuery,
        goBack: handleBack,
    };

    const Screen = SCREENS[step];

    return (
        <div className={cls.AddTrackContainer}>
            <PanelHeader
                step={step}
                backStep={backStep}
                uploading={uploading}
                onBack={handleBack}
                onClose={CloseDialog}
            />

            <div className={cls.PanelBody}>
                <Screen {...ctx} />
            </div>
        </div>
    );
}
