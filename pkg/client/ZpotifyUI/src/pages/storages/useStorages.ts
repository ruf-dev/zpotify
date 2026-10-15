import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { StorageConfig } from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import { storageService } from '@/shared/api/StorageService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import type { StorageItem } from '@/shared/model/Storage.ts';

const STORAGES_KEY = ['storages'];

export function useStorages() {
    const isAdministrator = useUser((state) => state.userData?.permissions?.isAdministrator === true);
    const queryClient = useQueryClient();
    const toaster = useToaster();

    const query = useQuery<StorageItem[]>({
        queryKey: STORAGES_KEY,
        queryFn: () => storageService.ListStorages(),
        enabled: isAdministrator,
    });

    function refresh(): Promise<void> {
        return queryClient.invalidateQueries({ queryKey: STORAGES_KEY });
    }

    function createStorage(name: string, config: StorageConfig): Promise<StorageItem> {
        return storageService.CreateStorage(name, config).then((created) => refresh().then(() => created));
    }

    function updateStorage(id: string, name: string, config: StorageConfig): Promise<void> {
        return storageService.UpdateStorage(id, name, config).then(refresh);
    }

    function deleteStorage(storage: StorageItem): Promise<void> {
        return storageService.DeleteStorage(storage.id).then(refresh).catch(toaster.catch);
    }

    function setDefaultStorage(storage: StorageItem): Promise<void> {
        return storageService.SetDefaultStorage(storage.id).then(refresh).catch(toaster.catch);
    }

    function testStorage(storage: StorageItem): Promise<void> {
        return storageService
            .TestStorage(storage.id)
            .then(() =>
                toaster.bake({
                    title: 'Storage is reachable',
                    description: storage.name,
                    level: 'Info',
                    isDismissable: true,
                }),
            )
            .catch(toaster.catch);
    }

    function connectGoogleDrive(storage: StorageItem): Promise<void> {
        return storageService
            .StartGoogleDriveAuth(storage.id)
            .then((consentUrl) => window.location.assign(consentUrl))
            .catch(toaster.catch);
    }

    return {
        storages: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
        createStorage,
        updateStorage,
        deleteStorage,
        setDefaultStorage,
        testStorage,
        connectGoogleDrive,
    };
}
