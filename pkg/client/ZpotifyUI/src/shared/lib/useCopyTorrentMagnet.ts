import { torrentService } from '@/shared/api/TorrentService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import type { ServiceError } from '@/shared/api/Errors.ts';
import type { TorrentJob } from '@/app/api/zpotify';

class ClipboardWriteError extends Error {}

function writeToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text).catch(() => {
        throw new ClipboardWriteError();
    });
}

export function useCopyTorrentMagnet() {
    const toaster = useToaster();

    function copyMagnet(job: TorrentJob): Promise<void> {
        if (!job.id) return Promise.resolve();

        return torrentService
            .GetTorrentMagnet({ jobId: job.id })
            .then((res) => writeToClipboard(res.magnetUri ?? ''))
            .then(() => {
                toaster.bake({
                    title: 'magnet link copied',
                    description: job.torrentName ?? '',
                    level: 'Info',
                    isDismissable: true,
                });
                if (job.isPrivate) {
                    toaster.bake({
                        title: 'private tracker torrent',
                        description:
                            'this link may contain your personal tracker passkey — share it only with people you trust',
                        level: 'Warn',
                        isDismissable: true,
                    });
                }
            })
            .catch((err: unknown) => {
                if (err instanceof ClipboardWriteError) {
                    toaster.bake({
                        title: 'could not copy magnet link',
                        description: '',
                        level: 'Error',
                        isDismissable: true,
                    });
                    return;
                }
                toaster.catch(err as ServiceError);
            });
    }

    return { copyMagnet };
}
