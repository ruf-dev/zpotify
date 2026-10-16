import { useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/pages/storages/components/StorageRow/StorageRow.module.css';
import TestSpinner from '@/pages/storages/components/StorageRow/components/TestSpinner/TestSpinner.tsx';
import { formatBytes } from '@/pages/storages/processes/formatBytes.ts';
import { STORAGE_KIND_LABELS } from '@/shared/model/Storage.ts';
import type { StorageItem } from '@/shared/model/Storage.ts';

export interface StorageRowActions {
    onTest: (storage: StorageItem) => Promise<void>;
    onSetDefault: (storage: StorageItem) => void;
    onEdit: (storage: StorageItem) => void;
    onConnectGoogle: (storage: StorageItem) => void;
    onDelete: (storage: StorageItem) => void;
}

interface Props {
    storage: StorageItem;
    actions: StorageRowActions;
    isLocked: boolean;
}

export default function StorageRow({ storage, actions, isLocked }: Props) {
    const [isTesting, setIsTesting] = useState(false);

    const isLocal = storage.kind === 'local';
    const isDrive = storage.kind === 'google_drive';
    const isNotConnected = !storage.isConnected;
    const usage =
        storage.quotaBytes !== undefined
            ? `${formatBytes(storage.usedBytes)} of ${formatBytes(storage.quotaBytes)}`
            : `${formatBytes(storage.usedBytes)} used`;

    function handleTest() {
        setIsTesting(true);
        actions.onTest(storage).finally(() => setIsTesting(false));
    }

    function handleSetDefault() {
        actions.onSetDefault(storage);
    }

    function handleEdit() {
        actions.onEdit(storage);
    }

    function handleConnectGoogle() {
        actions.onConnectGoogle(storage);
    }

    function handleDelete() {
        actions.onDelete(storage);
    }

    return (
        <li className={cls.StorageRowContainer}>
            <div className={cls.Info}>
                <div className={cls.NameLine}>
                    <span className={cls.Name}>{storage.name}</span>
                    {storage.isDefault && <span className={cls.Badge}>Default</span>}
                    {isDrive && isNotConnected && <span className={cls.WarnBadge}>Not connected</span>}
                </div>
                <span className={cls.Meta}>
                    {STORAGE_KIND_LABELS[storage.kind]} · {usage}
                </span>
            </div>

            <div className={cls.Actions}>
                <Button variant="ghost" disabled={isTesting || isLocked} onClick={handleTest}>
                    <TestSpinner isActive={isTesting} />
                    Test
                </Button>
                <Button variant="ghost" disabled={storage.isDefault || isNotConnected} onClick={handleSetDefault}>
                    Set default
                </Button>
                {!isLocal && (
                    <Button variant="ghost" disabled={isLocked} onClick={handleEdit}>
                        Edit
                    </Button>
                )}
                {isDrive && (
                    <Button variant="ghost" disabled={isLocked} onClick={handleConnectGoogle}>
                        {isNotConnected ? 'Connect Google' : 'Reconnect'}
                    </Button>
                )}
                {!isLocal && !storage.isDefault && (
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                )}
            </div>
        </li>
    );
}
