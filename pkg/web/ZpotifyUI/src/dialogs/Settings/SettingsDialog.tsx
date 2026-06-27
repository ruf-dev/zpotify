import cls from '@/dialogs/Settings/SettingsDialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import UISettingsWidget from '@/widgets/UISettings/UISettingsWidget.tsx';
import Chip from '@/shared/ui/Chip.tsx';

export default function SettingsDialog() {
    const { CloseDialog } = useDialog();

    return (
        <div className={cls.SettingsDialogContainer}>
            <div className={cls.Header}>
                <span className={cls.Title}>Settings</span>
                <Chip value="×" onClick={CloseDialog} />
            </div>
            <UISettingsWidget />
        </div>
    );
}
