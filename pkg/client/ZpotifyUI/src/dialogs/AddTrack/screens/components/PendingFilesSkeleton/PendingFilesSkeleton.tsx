import cls from '@/dialogs/AddTrack/screens/components/PendingFilesSkeleton/PendingFilesSkeleton.module.css';

const SKELETON_FOLDER_COUNT = 2;
const SKELETON_FILES_PER_FOLDER = 2;

function range(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
}

export default function PendingFilesSkeleton() {
    return (
        <div className={cls.PendingFilesSkeletonContainer} aria-busy="true" aria-label="Loading pending uploads">
            <div className={cls.ActionsRow}>
                <div className={cls.CheckboxBlock} />
                <div className={cls.ActionsRight}>
                    <div className={cls.ButtonBlock} />
                    <div className={cls.ButtonBlockWide} />
                </div>
            </div>
            {range(SKELETON_FOLDER_COUNT).map((folderIndex) => (
                <div key={folderIndex} className={cls.FolderGroup}>
                    <div className={cls.FolderBlock} />
                    {range(SKELETON_FILES_PER_FOLDER).map((fileIndex) => (
                        <div key={fileIndex} className={cls.FileBlock} />
                    ))}
                </div>
            ))}
        </div>
    );
}
