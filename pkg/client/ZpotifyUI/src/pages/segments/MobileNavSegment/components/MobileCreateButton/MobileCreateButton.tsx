import { PlusIcon } from '@/assets/icons/PlusIcon.tsx';
import AddTrackDialog from '@/dialogs/AddTrack/AddTrackDialog.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import cls from '@/pages/segments/MobileNavSegment/components/MobileCreateButton/MobileCreateButton.module.css';

export default function MobileCreateButton() {
    const { OpenDialog } = useDialog();

    function handleClick() {
        OpenDialog(<AddTrackDialog />);
    }

    return (
        <button type="button" className={cls.MobileCreateButtonContainer} onClick={handleClick}>
            <PlusIcon />
        </button>
    );
}
