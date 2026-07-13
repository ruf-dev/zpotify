import cls from '@/components/CoverUploadProgress/CoverUploadProgress.module.css';

interface CoverUploadProgressProps {
    progress: number;
}

export default function CoverUploadProgress({ progress }: CoverUploadProgressProps) {
    const style = { '--upload-pct': String(progress / 100) } as React.CSSProperties;

    return (
        <div className={cls.ProgressOverlay} style={style}>
            <div className={cls.ProgressFill} />
            <span className={cls.ProgressLabel}>{progress}%</span>
        </div>
    );
}
