import { useEffect, useMemo, useState } from 'react';

import type { TorrentFileEntry } from '@/app/api/zpotify';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';

export function useTorrentFileSelection(id: string) {
    const [loading, setLoading] = useState(true);
    const [torrentName, setTorrentName] = useState('');
    const [entries, setEntries] = useState<TorrentFileEntry[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const toaster = useToaster();

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        torrentService
            .GetTorrentFile({ id })
            .then((res) => {
                const fileEntries = res.file?.files ?? [];
                setTorrentName(res.file?.torrentName ?? '');
                setEntries(fileEntries);
                setSelectedPaths(new Set(fileEntries.filter((e) => e.supported).map((e) => e.path ?? '')));
            })
            .catch((err: unknown) => toaster.catch(err as ServiceError))
            .finally(() => setLoading(false));
    }, [id]);

    const supportedPaths = useMemo(() => entries.filter((e) => e.supported).map((e) => e.path ?? ''), [entries]);

    const allSelected = useMemo(
        () => supportedPaths.length > 0 && supportedPaths.every((path) => selectedPaths.has(path)),
        [supportedPaths, selectedPaths],
    );

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
        torrentName,
        entries,
        selectedPaths,
        allSelected,
        handleToggleSelect,
        handleToggleSelectAll,
    };
}
