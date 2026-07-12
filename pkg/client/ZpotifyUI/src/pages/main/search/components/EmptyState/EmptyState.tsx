import { SearchIcon } from '@/assets/icons/SearchIcon';
import cls from '@/pages/main/search/components/EmptyState/EmptyState.module.css';

interface EmptyStateProps {
    query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
    return (
        <div className={cls.EmptyStateContainer}>
            <div className={cls.Icon}>
                <SearchIcon />
            </div>
            <p className={cls.Message}>No results for &quot;{query}&quot;</p>
            <p className={cls.Hint}>Try a different search term</p>
        </div>
    );
}
