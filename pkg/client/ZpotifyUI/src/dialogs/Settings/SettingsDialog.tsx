import {ModalClose} from '@vervstack/chures';

import cls from '@/dialogs/Settings/SettingsDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import {useDialog} from '@/app/hooks/Dialog.tsx';
import UISettingsWidget from '@/widgets/UISettings/UISettingsWidget.tsx';

export default function SettingsDialog() {
    const {CloseDialog} = useDialog();

    return (
        <div className={cls.SettingsDialogContainer}>
            <div className={cls.Header}>
                <span className={cls.Title}>Settings</span>
                <ModalClose
                    className={modalCloseCls.ModalCloseButton}
                    onClick={CloseDialog}/>
            </div>
            <UISettingsWidget/>
        </div>
    );
}
