import { Button } from '@vervstack/chures';

import IconButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.tsx';
import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/EditControls/EditControls.module.css';
import EditIcon from '@/assets/icons/EditIcon.tsx';
import SaveIcon from '@/assets/icons/SaveIcon.tsx';
import { RemoveIcon } from '@/assets/icons/RemoveIcon.tsx';

export interface EditControlsProps {
    canEdit?: boolean;
    editMode: boolean;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onEnterEditMode: () => void;
}

export default function EditControls({
    canEdit,
    editMode,
    saving,
    onSave,
    onCancel,
    onEnterEditMode,
}: EditControlsProps) {
    if (!canEdit) return null;

    if (editMode) {
        return (
            <>
                <Button
                    variant="unstyled"
                    className={cls.SaveIconButton}
                    aria-label="Save changes"
                    onClick={onSave}
                    disabled={saving}
                >
                    <SaveIcon />
                </Button>
                <IconButton ariaLabel="Cancel editing" onClick={onCancel} disabled={saving}>
                    <RemoveIcon />
                </IconButton>
            </>
        );
    }

    return (
        <IconButton className={cls.EditButton} ariaLabel="Edit" onClick={onEnterEditMode}>
            <EditIcon />
        </IconButton>
    );
}
