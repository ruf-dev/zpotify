
import cls from '@/widgets/Header/HeaderPart.module.css';
import UserWidget from '@/widgets/User/UserWidget.tsx';
import AddTrackButton from '@/features/upload/AddTrackButton.tsx';
import AddTrackDialog from '@/dialogs/AddTrack/AddTrackDialog.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';

export default function HeaderPart() {
    const { OpenDialog } = useDialog();

    function handleAddTrack() {
        OpenDialog(<AddTrackDialog />);
    }

    return (
        <div className={cls.Header}>
            <div className={cls.SearchContainer}>

            </div>

            <div className={cls.UserContainer}>
                <AddTrackButton onClick={handleAddTrack} />
                <UserWidget />
            </div>
        </div>
    );
}
