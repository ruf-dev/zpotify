import cls from '@/shared/ui/CachedIndicator.module.css';
import { HomeIcon } from '@/assets/icons/HomeIcon.tsx';

export default function CachedIndicator() {
    return (
        <span
            className={cls.CachedIndicatorContainer}
            data-tooltip-id="root-tooltip"
            data-tooltip-content="Cached — playable without internet"
        >
            <HomeIcon />
        </span>
    );
}
