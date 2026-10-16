import { useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button, ConfirmDialog } from '@vervstack/chures';

import cls from '@/pages/storages/StoragesPage.module.css';
import StorageRow from '@/pages/storages/components/StorageRow/StorageRow.tsx';
import type { StorageRowActions } from '@/pages/storages/components/StorageRow/StorageRow.tsx';
import SecretsKeyNotice from '@/pages/storages/components/SecretsKeyNotice/SecretsKeyNotice.tsx';
import StorageRowSkeleton from '@/pages/storages/components/StorageRowSkeleton/StorageRowSkeleton.tsx';
import { useStorages } from '@/pages/storages/useStorages.ts';
import EditStorageDialog from '@/dialogs/EditStorage/EditStorageDialog.tsx';
import type { StorageConfig } from '@/app/api/zpotify';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { Path } from '@/app/routing/paths.ts';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import type { StorageItem } from '@/shared/model/Storage.ts';

const SKELETON_ROWS = 3;
const GOOGLE_AUTH_FAILED = 'google_drive_auth_failed';

export default function StoragesPage() {
    const userData = useUser((state) => state.userData);
    const storages = useStorages();
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();
    const [searchParams, setSearchParams] = useSearchParams();
    const isErrorParamHandled = useRef(false);

    useEffect(() => {
        const errorCode = searchParams.get('error');
        if (!errorCode || isErrorParamHandled.current) return;
        isErrorParamHandled.current = true;

        toaster.bake({
            title: 'Google Drive connection failed',
            description:
                errorCode === GOOGLE_AUTH_FAILED ? 'Google did not grant access. Try connecting again.' : errorCode,
            level: 'Error',
            isDismissable: true,
        });

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('error');
        setSearchParams(nextParams, { replace: true });
    }, [searchParams, setSearchParams, toaster.bake]);

    if (!userData) return null;
    if (userData.permissions?.isAdministrator !== true) return <Navigate to={Path.HomePage} replace />;

    function handleAdd() {
        OpenDialog(<EditStorageDialog onSubmit={submitCreate} />);
    }

    function submitCreate(name: string, config: StorageConfig): Promise<void> {
        return storages.createStorage(name, config).then((created) => {
            if (created.kind === 'google_drive') {
                toaster.bake({
                    title: 'Connect Google to finish setup',
                    description: `Use the Connect Google button on "${created.name}".`,
                    level: 'Info',
                    isDismissable: true,
                });
            }
        });
    }

    function handleEdit(storage: StorageItem) {
        function submitUpdate(name: string, config: StorageConfig): Promise<void> {
            return storages.updateStorage(storage.id, name, config);
        }

        OpenDialog(<EditStorageDialog storage={storage} onSubmit={submitUpdate} />);
    }

    function handleDelete(storage: StorageItem) {
        function confirmDelete(): Promise<void> {
            return storages.deleteStorage(storage);
        }

        OpenDialog(
            <ConfirmDialog
                danger
                title="Delete storage"
                message={`Delete "${storage.name}"? Storages that still hold files cannot be deleted.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onClose={CloseDialog}
            />,
        );
    }

    const rowActions: StorageRowActions = {
        onTest: storages.testStorage,
        onSetDefault: storages.setDefaultStorage,
        onEdit: handleEdit,
        onConnectGoogle: storages.connectGoogleDrive,
        onDelete: handleDelete,
    };

    const isLocked = !storages.isSecretsKeyConfigured;

    return (
        <div className={cls.StoragesPageContainer}>
            <div className={cls.Header}>
                <h1 className={cls.Title}>Storages</h1>
                <Button variant="primary" disabled={isLocked} onClick={handleAdd}>
                    Add storage
                </Button>
            </div>

            {isLocked && !storages.isLoading && <SecretsKeyNotice />}

            {storages.isLoading && (
                <ul className={cls.List}>
                    {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                        <StorageRowSkeleton key={i} />
                    ))}
                </ul>
            )}

            {storages.isError && (
                <div className={cls.ErrorState}>
                    <span className={cls.ErrorText}>Failed to load storages</span>
                    <Button variant="secondary" onClick={() => storages.refetch()}>
                        Retry
                    </Button>
                </div>
            )}

            {!storages.isLoading && !storages.isError && (
                <ul className={cls.List}>
                    {storages.storages.map((storage) => (
                        <StorageRow key={storage.id} storage={storage} actions={rowActions} isLocked={isLocked} />
                    ))}
                </ul>
            )}
        </div>
    );
}
