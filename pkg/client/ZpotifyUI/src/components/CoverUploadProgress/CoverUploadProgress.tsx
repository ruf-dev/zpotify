import cls from '@/components/CoverUploadProgress/CoverUploadProgress.module.css';

interface CoverUploadProgressProps {
    progress: number;
}

export default function CoverUploadProgress({ progress }: CoverUploadProgressProps) {
    return (
        <div className={cls.ProgressPill}>
            <span className={cls.ProgressLabel}>{progress}%</span>
        </div>
    );
}
