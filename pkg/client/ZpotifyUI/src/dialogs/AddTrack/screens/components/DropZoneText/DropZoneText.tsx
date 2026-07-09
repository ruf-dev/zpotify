import cls from '@/dialogs/AddTrack/screens/components/DropZoneText/DropZoneText.module.css';

interface DropZoneTextProps {
    dragOver: boolean;
}

export default function DropZoneText({ dragOver }: DropZoneTextProps) {
    if (dragOver) {
        return (
            <div className={cls.TextContentContainer}>
                <span className={cls.TextDragOver}>release to upload</span>
            </div>
        );
    }
    return (
        <div className={cls.TextContentContainer}>
            <span className={cls.TextIdle}>drop your track(s) here</span>
            <span className={cls.TextSub}>
                or <u>click to browse</u>
            </span>
        </div>
    );
}
