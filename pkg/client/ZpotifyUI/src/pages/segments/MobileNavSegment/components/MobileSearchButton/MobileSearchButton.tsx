import { useNavigate } from 'react-router-dom';

import { SearchIcon } from '@/assets/icons/SearchIcon.tsx';
import { Path } from '@/app/routing/paths.ts';
import cls from '@/pages/segments/MobileNavSegment/components/MobileSearchButton/MobileSearchButton.module.css';

export default function MobileSearchButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate(Path.SearchPage);
    }

    return (
        <button type="button" className={cls.MobileSearchButtonContainer} onClick={handleClick}>
            <SearchIcon />
        </button>
    );
}
