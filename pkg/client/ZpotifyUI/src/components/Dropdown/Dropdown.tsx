import {useEffect, useRef, useState} from 'react';

import {useDropdownClose, useSearchResults} from '@/components/Dropdown/Dropdown.hooks';
import {getOptionId, getOptionLabel} from '@/components/Dropdown/Dropdown.types';
import type {DropdownOption} from '@/components/Dropdown/Dropdown.types';
import DropdownCreateRow from '@/components/Dropdown/DropdownCreateRow';
import DropdownOptionRow from '@/components/Dropdown/DropdownOptionRow';
import DropdownSearchRow from '@/components/Dropdown/DropdownSearchRow';
import DropdownSkeletonList from '@/components/Dropdown/DropdownSkeletonList';
import cls from '@/components/Dropdown/Dropdown.module.css';
import {useToaster} from "@/shared/lib/toaster/ToasterZ.ts";

export type {DropdownOption};

interface DropdownProps {
    options?: DropdownOption[];
    initialOptions?: DropdownOption[];
    onSearch?: (query: string) => Promise<DropdownOption[]>;
    onCreate?: (name: string) => Promise<DropdownOption>;
    onPick: (option: DropdownOption) => void;
    onClose: () => void;
    excluded?: string[];
    multiSelect?: boolean;
    selected?: string[];
    placeholder?: string;
    emptyHint?: string;
    isLoading?: boolean;
    skeletonRowCount?: number;
}

export default function Dropdown(
    {
        onSearch, onCreate, onPick, onClose, placeholder,
        options = [], initialOptions = [], excluded = [], selected = [],
        multiSelect = false,
        isLoading = false,
        emptyHint = 'no results found',
        skeletonRowCount = 4,
    }: DropdownProps) {

    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const hasSearch = Boolean(onSearch);
    const { searchResults, isSearching } = useSearchResults(query, onSearch, initialOptions);

    useDropdownClose(panelRef, onClose);
    const toaster = useToaster();

    useEffect(() => {
        if (hasSearch) inputRef.current?.focus();
    }, [hasSearch]);

    const visibleOptions = (onSearch ? searchResults : options)
        .filter(
            (opt) => !excluded.includes(getOptionId(opt)),
        );

    const trimmedQuery = query.trim();
    const exactMatch = visibleOptions.some(
        (o) => getOptionLabel(o).toLowerCase() === trimmedQuery.toLowerCase(),
    );
    const showCreate = Boolean(onCreate) && trimmedQuery.length > 0 && !exactMatch;

    async function handleCreate() {
        if (!trimmedQuery || creating || !onCreate) return;
        setCreating(true);

        onCreate(trimmedQuery)
            .then(handlePick)
            .catch(toaster.catch)
            .finally(() => setCreating(false));
    }

    function handlePick(opt: DropdownOption) {
        onPick(opt);
        if (!multiSelect) onClose();
    }

    function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value);
    }

    function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (visibleOptions.length > 0) {
                handlePick(visibleOptions[0]);
            } else if (showCreate) {
                handleCreate();
            }
        }
    }

    const resolvedPlaceholder = placeholder ?? (onCreate ? 'search or add new…' : 'search…');

    return (
        <div ref={panelRef} className={cls.DropdownContainer}>
            {hasSearch && (
                <DropdownSearchRow
                    inputRef={inputRef}
                    query={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={resolvedPlaceholder}
                />
            )}
            <div className={cls.ResultsList}>
                {isLoading || isSearching ? (
                    <DropdownSkeletonList count={skeletonRowCount}/>
                ) : (
                    <>
                        {visibleOptions.map((opt) => (
                            <DropdownOptionRow
                                key={getOptionId(opt)}
                                opt={opt}
                                isSelected={selected.includes(getOptionId(opt))}
                                multiSelect={multiSelect}
                                onPick={handlePick}
                            />
                        ))}
                        {showCreate && (
                            <DropdownCreateRow
                                query={trimmedQuery}
                                withBorder={visibleOptions.length > 0}
                                onCreate={handleCreate}
                            />
                        )}
                        {visibleOptions.length === 0 && !showCreate && (
                            <div className={cls.EmptyHint}>{emptyHint}</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
