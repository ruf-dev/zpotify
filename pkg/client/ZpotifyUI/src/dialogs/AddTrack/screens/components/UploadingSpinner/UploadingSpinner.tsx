import { SpinnerIcon } from '@/assets/icons/SpinnerIcon';
import cls from '@/dialogs/AddTrack/screens/components/UploadingSpinner/UploadingSpinner.module.css';

export default function UploadingSpinner() {
    return (
        <div className={cls.UploadingStateContainer}>
            <SpinnerIcon />
            <span>uploading…</span>
        </div>
    );
}
