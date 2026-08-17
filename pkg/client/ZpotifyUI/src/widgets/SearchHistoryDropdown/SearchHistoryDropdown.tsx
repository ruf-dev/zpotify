import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { useDropdownClose } from '@/components/Dropdown/Dropdown.hooks.ts';
import { albumPath, artistPath, playlistPath } from '@/app/routing/paths.ts';
import { useSearchHistory } from '@/entities/search/useSearchHistory.ts';
import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import { useIsMobile } from '@/shared/lib/useIsMobile.ts';
import type { SearchHistoryEntry } from '@/shared/api/SearchHistoryService.ts';
import cls from '@/widgets/SearchHistoryDropdown/SearchHistoryDropdown.module.css';

const MOBILE_ENTRY_LIMIT = 3;
const DESKTOP_ENTRY_LIMIT = 5;

interface SearchHistoryDropdownProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
}

function findingPath(findingType: string, findingId: string): string | null {
    switch (findingType) {
        case 'artist':
            return artistPath(findingId);
        case 'album':
            return albumPath(findingId);
        case 'playlist':
            return playlistPath(findingId);
        default:
            return null;
    }
}

export default function SearchHistoryDropdown(props: SearchHistoryDropdownProps) {
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const entries = useSearchHistory((s) => s.entries);
    const fetchHistory = useSearchHistory((s) => s.fetch);
    const setQuery = useSearchQuery((s) => s.setQuery);
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useDropdownClose(panelRef, props.onClose);

    useEffect(
        function loadHistoryOnOpen() {
            if (props.open) fetchHistory();
        },
        [props.open, fetchHistory],
    );

    useEffect(
        function trackAnchorRect() {
            if (!props.open) return undefined;

            function updateRect() {
                setAnchorRect(props.anchorRef.current?.getBoundingClientRect() ?? null);
            }

            updateRect();
            window.addEventListener('resize', updateRect);
            window.addEventListener('scroll', updateRect, true);
            return () => {
                window.removeEventListener('resize', updateRect);
                window.removeEventListener('scroll', updateRect, true);
            };
        },
        [props.open],
    );

    function handleQueryClick(query: string) {
        setQuery(query);
        props.onClose();
    }

    function handleFindingClick(entry: SearchHistoryEntry) {
        const path = findingPath(entry.findingType, entry.findingId);
        if (!path) return;
        props.onClose();
        navigate(path);
    }

    if (!props.open || !anchorRect) return null;

    const limit = isMobile ? MOBILE_ENTRY_LIMIT : DESKTOP_ENTRY_LIMIT;
    const visibleEntries = entries.slice(0, limit);
    const recentQueries = visibleEntries.filter((entry) => !entry.findingType);
    const recentFindings = visibleEntries.filter((entry) => !!entry.findingType);

    if (recentQueries.length === 0 && recentFindings.length === 0) return null;

    return createPortal(
        <div
            ref={panelRef}
            className={cls.SearchHistoryDropdownContainer}
            style={{ position: 'fixed', top: anchorRect.bottom + 8, left: anchorRect.left, width: anchorRect.width }}
        >
            {recentQueries.length > 0 && (
                <div className={cls.Section}>
                    <span className={cls.SectionLabel}>Recent searches</span>
                    {recentQueries.map((entry, idx) => (
                        <div
                            key={`query-${idx}-${entry.query}`}
                            className={cls.QueryRow}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleQueryClick(entry.query)}
                        >
                            <SearchIcon />
                            <span className={cls.QueryText}>{entry.query}</span>
                        </div>
                    ))}
                </div>
            )}
            {recentFindings.length > 0 && (
                <div className={cls.Section}>
                    <span className={cls.SectionLabel}>Recently viewed</span>
                    {recentFindings.map((entry, idx) => (
                        <div
                            key={`finding-${idx}-${entry.findingId}`}
                            className={cls.FindingRow}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFindingClick(entry)}
                        >
                            <CoverWithFallback
                                coverUrl={entry.findingCoverUrl}
                                uuid={entry.findingId}
                                name={entry.findingName}
                                className={cls.FindingCover}
                            />
                            <div className={cls.FindingTextWrapper}>
                                <span className={cls.FindingName}>{entry.findingName}</span>
                                <span className={cls.FindingQuery}>{entry.query}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>,
        document.body,
    );
}
