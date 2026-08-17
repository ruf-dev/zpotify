import { Input } from '@vervstack/chures';
import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import SearchHistoryDropdown from '@/widgets/SearchHistoryDropdown/SearchHistoryDropdown.tsx';
import cls from '@/pages/main/search/components/MobileSearchInput/MobileSearchInput.module.css';

export default function MobileSearchInput() {
    const query = useSearchQuery((state) => state.query);
    const setQuery = useSearchQuery((state) => state.setQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleChange(value: string) {
        setQuery(value);
    }

    function handleFocus() {
        setIsFocused(true);
    }

    function handleBlur() {
        setIsFocused(false);
    }

    return (
        <>
            <Input
                ref={inputRef}
                value={query}
                setValue={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                startIcon={<SearchIcon />}
                placeholder="Search artists, albums, playlists…"
                autoFocus
                className={cls.MobileSearchInputContainer}
                inputClassName={cls.MobileSearchInputField}
            />
            <SearchHistoryDropdown
                anchorRef={inputRef}
                open={isFocused && query.trim().length === 0}
                onClose={handleBlur}
            />
        </>
    );
}
