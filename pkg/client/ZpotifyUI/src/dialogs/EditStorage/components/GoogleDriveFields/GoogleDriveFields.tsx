import { Input } from '@vervstack/chures';

import cls from '@/dialogs/EditStorage/components/GoogleDriveFields/GoogleDriveFields.module.css';
import type { StorageFormValues } from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';

const KEEP_CURRENT = 'Leave empty to keep current';

interface Props {
    values: StorageFormValues;
    isEdit: boolean;
    onChange: <K extends keyof StorageFormValues>(key: K, value: StorageFormValues[K]) => void;
}

export default function GoogleDriveFields({ values, isEdit, onChange }: Props) {
    return (
        <div className={cls.GoogleDriveFieldsContainer}>
            <Input label="Client id" value={values.clientId} setValue={(v) => onChange('clientId', v)} />
            <Input
                label="Client secret"
                type="password"
                value={values.clientSecret}
                setValue={(v) => onChange('clientSecret', v)}
                placeholder={isEdit ? KEEP_CURRENT : undefined}
            />
            <Input label="Root folder id" value={values.rootFolderId} setValue={(v) => onChange('rootFolderId', v)} />
        </div>
    );
}
