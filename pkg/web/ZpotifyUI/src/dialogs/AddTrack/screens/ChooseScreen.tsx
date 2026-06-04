import {useEffect, useState} from 'react';
import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import useUser from '@/hooks/user/User.ts';

interface ChooseScreenProps {
    onUploadNew: () => void;
    onFromLibrary: () => void;
}

function LibraryCard({onClick, disabled}: {onClick: () => void; disabled: boolean}) {
    return (
        <div className={`${cls.Card} ${disabled ? cls.CardDisabled : ''}`} onClick={disabled ? undefined : onClick}>
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
    );
}

interface UploadCardProps {
    atLimit: boolean;
    loading: boolean;
    pendingCount: number;
    maxPendingTracks: number;
    onClick: () => void;
}

function UploadCard({atLimit, loading, pendingCount, maxPendingTracks, onClick}: UploadCardProps) {
    return (
        <div
            className={`${cls.Card} ${cls.CardAccent} ${atLimit ? cls.CardDisabled : ''}`}
            onClick={atLimit ? undefined : onClick}
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
            {!loading && maxPendingTracks > 0 && (
                <span className={`${cls.UsageChip} ${atLimit ? cls.UsageChipLimit : ''}`}>
                    {pendingCount} / {maxPendingTracks}
                </span>
            )}
        </div>
    );
}

export default function ChooseScreen({onUploadNew, onFromLibrary}: ChooseScreenProps) {
    const {Services, userData} = useUser();

    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Services().File().ListUploadedFiles({temporaryOnly: true})
            .then(res => setPendingCount((res.files || []).length))
            .finally(() => setLoading(false));
    }, []);

    const maxPendingTracks = Number(userData?.permissions?.maxPendingTracks ?? 0);
    const atLimit = maxPendingTracks === 0 || pendingCount >= maxPendingTracks;

    return (
        <div className={cls.ChooseScreenContainer}>
            <div className={cls.GridWrapper}>
                <LibraryCard
                    onClick={onFromLibrary}
                    disabled={pendingCount === 0}/>
                <UploadCard
                    atLimit={atLimit}
                    loading={loading}
                    pendingCount={pendingCount}
                    maxPendingTracks={maxPendingTracks}
                    onClick={onUploadNew}
                />
            </div>
        </div>
    );
}
