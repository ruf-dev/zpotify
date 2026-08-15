import { Input } from '@vervstack/chures';
import { useEffect, useRef } from 'react';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import cls from '@/pages/main/search/components/MobileSearchInput/MobileSearchInput.module.css';

export default function MobileSearchInput() {
    const query = useSearchQuery((state) => state.query);
    const setQuery = useSearchQuery((state) => state.setQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleChange(value: string) {
        setQuery(value);
    }

    return (
        <Input
            ref={inputRef}
            value={query}
            setValue={handleChange}
            startIcon={<SearchIcon />}
            placeholder="Search artists, albums, playlists…"
            autoFocus
            className={cls.MobileSearchInputContainer}
            inputClassName={cls.MobileSearchInputField}
        />
    );
}
