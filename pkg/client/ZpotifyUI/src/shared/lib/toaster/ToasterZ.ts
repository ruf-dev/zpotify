import { useToaster as useChuresToaster } from '@vervstack/chures';
import type { Toast, ToasterStore } from '@vervstack/chures';

import { ErrorReason, ServiceError } from '@/shared/api/Errors.ts';

export type { Toast };

export interface Toaster extends ToasterStore {
    catch: (e: ServiceError) => void;
}

const internalErrors: ErrorReason[] = [ErrorReason.ACCESS_TOKEN_NOT_FOUND, ErrorReason.REFRESH_TOKEN_NOT_FOUND];

export function catchServiceError(e: ServiceError) {
    if (e.reason && internalErrors.includes(e.reason)) return;

    useChuresToaster.getState().bake({
        title: e.title,
        description: e.details,
        level: 'Error',
        isDismissable: true,
    });
}

export function useToaster(): Toaster {
    const store = useChuresToaster();

    return { ...store, catch: catchServiceError };
}
