import { ServiceError } from '@/shared/api/Errors.ts';

// wapi's torrent upload endpoint responds 409 with `{"id": <job id>}` when
// the caller already has a download registered for the same info hash - see
// writeExistingTorrentJob in internal/transport/wapi/torrent_upload.go.
const DUPLICATE_TORRENT_STATUS = 409;

export function parseDuplicateTorrentJobId(err: unknown): string | undefined {
    if (!(err instanceof ServiceError) || err.statusCode !== DUPLICATE_TORRENT_STATUS) {
        return undefined;
    }

    let body: unknown;
    try {
        body = JSON.parse(err.details);
    } catch {
        return undefined;
    }

    const jobId = (body as { id?: unknown })?.id;
    return typeof jobId === 'number' ? String(jobId) : undefined;
}
