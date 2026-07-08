import { SearchIcon } from '@/assets/icons/SearchIcon';
import cls from '@/components/Dropdown/Dropdown.module.css';

interface DropdownSearchRowProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    query: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder: string;
}

export default function DropdownSearchRow({
    inputRef,
    query,
    onChange,
    onKeyDown,
    placeholder,
}: DropdownSearchRowProps) {
    return (
        <div className={cls.SearchRow}>
            <div className={cls.SearchBox}>
                <span className={cls.SearchIcon}>
                    <SearchIcon />
                </span>
                {/* TODO: switch to chures Input once it supports ref/onKeyDown */}
                {/* eslint-disable-next-line no-restricted-syntax -- chures Input has no ref/onKeyDown support; this needs both for keyboard nav from the parent Dropdown */}
                <input
                    ref={inputRef}
                    className={cls.SearchInput}
                    value={query}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
