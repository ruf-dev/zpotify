import { useState } from 'react';
import { Button, Dropdown, Input, ModalClose } from '@vervstack/chures';
import type { DropdownOption } from '@vervstack/chures';

import cls from '@/dialogs/EditStorage/EditStorageDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import GoogleDriveFields from '@/dialogs/EditStorage/components/GoogleDriveFields/GoogleDriveFields.tsx';
import S3Fields from '@/dialogs/EditStorage/components/S3Fields/S3Fields.tsx';
import WebdavFields from '@/dialogs/EditStorage/components/WebdavFields/WebdavFields.tsx';
import {
    buildStorageConfig,
    toStorageFormValues,
    validateStorageName,
} from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';
import type { StorageFormValues } from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';
import type { StorageConfig } from '@/app/api/zpotify';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { STORAGE_KIND_LABELS } from '@/shared/model/Storage.ts';
import type { StorageItem, StorageKindName } from '@/shared/model/Storage.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const CREATABLE_KINDS: StorageKindName[] = ['s3', 'webdav', 'google_drive'];
const KIND_OPTIONS: DropdownOption[] = CREATABLE_KINDS.map((kind) => ({ id: kind, name: STORAGE_KIND_LABELS[kind] }));

interface Props {
    storage?: StorageItem;
    onSubmit: (name: string, config: StorageConfig) => Promise<unknown>;
}

export default function EditStorageDialog({ storage, onSubmit }: Props) {
    const { CloseDialog } = useDialog();
    const toaster = useToaster();

    const isEdit = storage !== undefined;
    const [kind, setKind] = useState<StorageKindName>(storage?.kind ?? CREATABLE_KINDS[0]);
    const [values, setValues] = useState<StorageFormValues>(() => toStorageFormValues(storage));
    const [isSaving, setIsSaving] = useState(false);

    const built = buildStorageConfig(kind, values, isEdit);
    const errors = [...validateStorageName(values.name), ...built.errors];
    const isValid = errors.length === 0 && built.config !== null;

    function handleChange<K extends keyof StorageFormValues>(key: K, value: StorageFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function handleKindChange(selected: string[]) {
        const next = selected[0];
        if (CREATABLE_KINDS.some((k) => k === next)) {
            setKind(next as StorageKindName);
        }
    }

    function handleSave() {
        if (!isValid || !built.config) return;

        setIsSaving(true);
        onSubmit(values.name.trim(), built.config)
            .then(CloseDialog)
            .catch(toaster.catch)
            .finally(() => setIsSaving(false));
    }

    return (
        <div className={cls.EditStorageDialogContainer}>
            <div className={cls.Header}>
                <span className={cls.Title}>{isEdit ? 'Edit storage' : 'Add storage'}</span>
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
            </div>

            <div className={cls.Body}>
                <Input label="Name" value={values.name} setValue={(v) => handleChange('name', v)} />

                {isEdit ? (
                    <span className={cls.KindLabel}>{STORAGE_KIND_LABELS[kind]}</span>
                ) : (
                    <Dropdown label="Kind" portal options={KIND_OPTIONS} value={[kind]} onChange={handleKindChange} />
                )}

                {kind === 's3' && <S3Fields values={values} isEdit={isEdit} onChange={handleChange} />}
                {kind === 'webdav' && <WebdavFields values={values} isEdit={isEdit} onChange={handleChange} />}
                {kind === 'google_drive' && (
                    <GoogleDriveFields values={values} isEdit={isEdit} onChange={handleChange} />
                )}
            </div>

            <div className={cls.Footer}>
                {!isValid && <span className={cls.Hint}>{errors[0]}</span>}
                <Button variant="primary" disabled={!isValid || isSaving} onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
}
