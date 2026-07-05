import { useEffect, useRef, useState } from 'react';

import type { DropdownOption } from '@/components/Dropdown/Dropdown.types';

const SEARCH_DEBOUNCE_MS = 250;

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
    const [isSearching, setIsSearching] = useState(false);

    const onSearchRef = useRef(onSearch);
    useEffect(() => {
        onSearchRef.current = onSearch;
    });

    useEffect(() => {
        const fn = onSearchRef.current;
        if (!fn) return;
        let cancelled = false;
        setIsSearching(true);
        const timer = setTimeout(() => {
            fn(query)
                .then((results) => {
                    if (!cancelled) setSearchResults(results);
                })
                .finally(() => {
                    if (!cancelled) setIsSearching(false);
                });
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    return { searchResults, isSearching };
}
