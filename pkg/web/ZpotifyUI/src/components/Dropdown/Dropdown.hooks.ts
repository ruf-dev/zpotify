import { useEffect, useState } from 'react';

import type { DropdownOption } from '@/components/Dropdown/Dropdown.types';

export function useDropdownClose(panelRef: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
    useEffect(() => {
        function handleMousedown(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handleMousedown, true);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleMousedown, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, panelRef]);
}

export function useSearchResults(
    query: string,
    onSearch?: (q: string) => Promise<DropdownOption[]>,
    initialOptions: DropdownOption[] = [],
) {
    const [searchResults, setSearchResults] = useState<DropdownOption[]>(initialOptions);

    useEffect(() => {
        if (!onSearch) return;
        let cancelled = false;
        onSearch(query).then((results) => {
            if (!cancelled) setSearchResults(results);
        });
        return () => {
            cancelled = true;
        };
    }, [query, onSearch]);

    return searchResults;
}
