import { useEffect, useMemo, useState } from 'react';

import type { TorrentFileEntry } from '@/app/api/zpotify';
import { buildTorrentFileTree } from '@/dialogs/AddTrack/screens/processes/torrentFileTree.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';

const RESOLVE_POLL_INTERVAL_MS = 2000;

export function useTorrentFileSelection(id: string) {
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const [failed, setFailed] = useState(false);
    const [torrentName, setTorrentName] = useState('');
    const [entries, setEntries] = useState<TorrentFileEntry[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const toaster = useToaster();

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        let isCancelled = false;
        let pollTimer: ReturnType<typeof setTimeout> | undefined;

        setLoading(true);
        setResolving(false);
        setFailed(false);

        function poll() {
            torrentService
                .GetTorrentFile({ id })
                .then((res) => {
                    if (isCancelled) return;

                    setTorrentName(res.file?.torrentName ?? '');
                    if (res.file?.isResolving) {
                        setResolving(true);
                        pollTimer = setTimeout(poll, RESOLVE_POLL_INTERVAL_MS);
                        return;
                    }

                    const fileEntries = res.file?.files ?? [];
                    setResolving(false);
                    setEntries(fileEntries);
                    setSelectedPaths(new Set(fileEntries.filter((e) => e.supported).map((e) => e.path ?? '')));
                })
                .catch((err: unknown) => {
                    if (isCancelled) return;

                    setResolving(false);
                    setFailed(true);
                    toaster.catch(err as ServiceError);
                })
                .finally(() => {
                    if (!isCancelled) setLoading(false);
                });
        }

        poll();

        return () => {
            isCancelled = true;
            clearTimeout(pollTimer);
        };
    }, [id]);

    const supportedPaths = useMemo(() => entries.filter((e) => e.supported).map((e) => e.path ?? ''), [entries]);

    const allSelected = useMemo(
        () => supportedPaths.length > 0 && supportedPaths.every((path) => selectedPaths.has(path)),
        [supportedPaths, selectedPaths],
    );

    const isPartiallySelected = useMemo(
        () => !allSelected && supportedPaths.some((path) => selectedPaths.has(path)),
        [allSelected, supportedPaths, selectedPaths],
    );

    const tree = useMemo(() => buildTorrentFileTree(entries), [entries]);

    function handleSetFolderSelected(paths: string[], checked: boolean) {
        setSelectedPaths((prev) => {
            const next = new Set(prev);
            paths.forEach((path) => (checked ? next.add(path) : next.delete(path)));
            return next;
        });
    }

    function handleToggleSelect(path: string) {
        setSelectedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }

    function handleToggleSelectAll(checked: boolean) {
        setSelectedPaths(checked ? new Set(supportedPaths) : new Set());
    }

    return {
        loading,
        resolving,
        failed,
        torrentName,
        entries,
        selectedPaths,
        allSelected,
        isPartiallySelected,
        tree,
        handleSetFolderSelected,
        handleToggleSelect,
        handleToggleSelectAll,
    };
}
