import { Input } from '@vervstack/chures';
import { useLocation, useNavigate } from 'react-router-dom';

import { SearchIcon } from '@/assets/icons/SearchIcon';
import { Path } from '@/app/routing/paths.ts';
import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import cls from '@/widgets/Header/components/HeaderSearchInput/HeaderSearchInput.module.css';

export default function HeaderSearchInput() {
    const query = useSearchQuery((state) => state.query);
    const setQuery = useSearchQuery((state) => state.setQuery);
    const navigate = useNavigate();
    const location = useLocation();

    function handleChange(value: string) {
        setQuery(value);
    }

    function handleFocus() {
        if (location.pathname !== Path.SearchPage) {
            navigate(Path.SearchPage);
        }
    }

    return (
        <Input
            value={query}
            setValue={handleChange}
            onFocus={handleFocus}
            startIcon={<SearchIcon />}
            placeholder="Search artists, albums, playlists…"
            className={cls.SearchInputContainer}
            inputClassName={cls.SearchInputField}
        />
    );
}
