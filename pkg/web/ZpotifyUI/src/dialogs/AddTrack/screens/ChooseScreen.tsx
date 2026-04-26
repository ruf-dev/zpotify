import {useEffect, useState} from 'react';
import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import {IFileService} from '@/processes/FileService.ts';

const UPLOAD_LIMIT = 5;

interface ChooseScreenProps {
    onUploadNew: () => void;
    onFromLibrary: () => void;
    fileService: IFileService;
}

export default function ChooseScreen({onUploadNew, onFromLibrary, fileService}: ChooseScreenProps) {
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fileService.ListUploadedFiles({temporaryOnly: true})
            .then(res => setPendingCount((res.files || []).length))
            .finally(() => setLoading(false));
    }, []);

    const atLimit = pendingCount >= UPLOAD_LIMIT;

    return (
        <div className={cls.ChooseScreenContainer}>
            <div className={cls.GridWrapper}>
                <div className={cls.Card} onClick={onFromLibrary}>
                    <div className={cls.IconCircle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                    </div>
                    <span className={cls.CardTitle}>pending uploads</span>
                    <span className={cls.CardSubtitle}>assign an already-uploaded file</span>
                </div>

                <div
                    className={`${cls.Card} ${cls.CardAccent} ${atLimit ? cls.CardDisabled : ''}`}
                    onClick={atLimit ? undefined : onUploadNew}
                >
                    <div className={cls.IconCircleAccent}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 16V4M8 8l4-4 4 4"/>
                            <path d="M4 20h16"/>
                        </svg>
                    </div>
                    <span className={cls.CardTitle}>upload new</span>
                    <span className={`${cls.CardSubtitle} ${atLimit ? '' : cls.CardSubtitleAccent}`}>
                        {atLimit ? 'upload limit reached' : 'drop a file from your device'}
                    </span>
                    {!loading && (
                        <span className={`${cls.UsageChip} ${atLimit ? cls.UsageChipLimit : ''}`}>
                            {pendingCount} / {UPLOAD_LIMIT}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}