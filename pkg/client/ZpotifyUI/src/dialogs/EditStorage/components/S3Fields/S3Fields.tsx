import { Input, Toggle } from '@vervstack/chures';

import cls from '@/dialogs/EditStorage/components/S3Fields/S3Fields.module.css';
import type { StorageFormValues } from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';

const KEEP_CURRENT = 'Leave empty to keep current';

interface Props {
    values: StorageFormValues;
    isEdit: boolean;
    onChange: <K extends keyof StorageFormValues>(key: K, value: StorageFormValues[K]) => void;
}

export default function S3Fields({ values, isEdit, onChange }: Props) {
    return (
        <div className={cls.S3FieldsContainer}>
            <Input label="Endpoint" value={values.endpoint} setValue={(v) => onChange('endpoint', v)} />
            <Input label="Region" value={values.region} setValue={(v) => onChange('region', v)} />
            <Input label="Bucket" value={values.bucket} setValue={(v) => onChange('bucket', v)} />
            <Input label="Access key id" value={values.accessKeyId} setValue={(v) => onChange('accessKeyId', v)} />
            <Input
                label="Secret access key"
                type="password"
                value={values.secretAccessKey}
                setValue={(v) => onChange('secretAccessKey', v)}
                placeholder={isEdit ? KEEP_CURRENT : undefined}
            />
            <Toggle
                label="Path-style addressing"
                checked={values.isPathStyle}
                onChange={(checked) => onChange('isPathStyle', checked)}
            />
        </div>
    );
}
