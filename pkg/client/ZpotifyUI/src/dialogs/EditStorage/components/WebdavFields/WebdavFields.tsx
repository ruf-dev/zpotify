import { Input } from '@vervstack/chures';

import cls from '@/dialogs/EditStorage/components/WebdavFields/WebdavFields.module.css';
import type { StorageFormValues } from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';

const KEEP_CURRENT = 'Leave empty to keep current';

interface Props {
    values: StorageFormValues;
    isEdit: boolean;
    onChange: <K extends keyof StorageFormValues>(key: K, value: StorageFormValues[K]) => void;
}

export default function WebdavFields({ values, isEdit, onChange }: Props) {
    return (
        <div className={cls.WebdavFieldsContainer}>
            <Input label="URL" value={values.url} setValue={(v) => onChange('url', v)} />
            <Input label="Username" value={values.username} setValue={(v) => onChange('username', v)} />
            <Input
                label="Password"
                type="password"
                value={values.password}
                setValue={(v) => onChange('password', v)}
                placeholder={isEdit ? KEEP_CURRENT : undefined}
            />
            <Input label="Root path" value={values.rootPath} setValue={(v) => onChange('rootPath', v)} />
        </div>
    );
}
