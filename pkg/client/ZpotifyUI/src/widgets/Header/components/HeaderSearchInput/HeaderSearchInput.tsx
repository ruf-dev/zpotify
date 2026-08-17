import { Input } from '@vervstack/chures';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import { Path } from '@/app/routing/paths.ts';
import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import SearchHistoryDropdown from '@/widgets/SearchHistoryDropdown/SearchHistoryDropdown.tsx';
import cls from '@/widgets/Header/components/HeaderSearchInput/HeaderSearchInput.module.css';

export default function HeaderSearchInput() {
    const query = useSearchQuery((state) => state.query);
    const setQuery = useSearchQuery((state) => state.setQuery);
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    function handleChange(value: string) {
        setQuery(value);
    }

    function handleFocus() {
        if (location.pathname !== Path.SearchPage) {
            navigate(Path.SearchPage);
        }
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
                className={cls.SearchInputContainer}
                inputClassName={cls.SearchInputField}
            />
            <SearchHistoryDropdown
                anchorRef={inputRef}
                open={isFocused && query.trim().length === 0}
                onClose={handleBlur}
            />
        </>
    );
}
