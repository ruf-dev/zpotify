import cls from '@/shared/ui/CachedIndicator.module.css';

export default function CachedIndicator() {
    return (
        <span
            className={cls.CachedDot}
            data-tooltip-id="root-tooltip"
            data-tooltip-content="Song is cached and can be listened to without internet"
        />
    );
}
