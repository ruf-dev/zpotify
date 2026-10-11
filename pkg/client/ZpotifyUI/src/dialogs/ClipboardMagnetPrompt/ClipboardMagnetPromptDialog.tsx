import { Button, ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/ClipboardMagnetPrompt/ClipboardMagnetPromptDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import AddTrackDialog from '@/dialogs/AddTrack/AddTrackDialog';

const HASH_PREVIEW_LENGTH = 8;

interface ClipboardMagnetPromptDialogProps {
    magnetUri: string;
    displayName: string;
    infoHash: string;
}

export default function ClipboardMagnetPromptDialog({
    magnetUri,
    displayName,
    infoHash,
}: ClipboardMagnetPromptDialogProps) {
    const { CloseDialog, OpenDialog } = useDialog();
    const setClipboardMagnetPromptEnabled = useUISettings((state) => state.setClipboardMagnetPromptEnabled);

    function handleImport() {
        OpenDialog(<AddTrackDialog initialMagnet={magnetUri} />);
    }

    function handleNever() {
        setClipboardMagnetPromptEnabled(false);
        CloseDialog();
    }

    return (
        <div className={cls.ClipboardMagnetPromptDialogContainer}>
            <div className={cls.Header}>
                <span className={cls.Title}>Magnet link in clipboard</span>
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
            </div>
            <div className={cls.Body}>
                <span className={cls.Name}>{displayName || 'Unnamed torrent'}</span>
                <span className={cls.Hash}>{infoHash.slice(0, HASH_PREVIEW_LENGTH)}</span>
            </div>
            <div className={cls.Actions}>
                <Button variant="primary" onClick={handleImport}>
                    Import
                </Button>
                <Button variant="ghost" onClick={CloseDialog}>
                    Not now
                </Button>
                <Button variant="ghost" onClick={handleNever}>
                    Never prompt me again
                </Button>
            </div>
        </div>
    );
}
