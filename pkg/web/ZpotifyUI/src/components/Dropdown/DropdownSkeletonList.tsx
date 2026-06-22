import cls from '@/components/Dropdown/Dropdown.module.css';

export default function DropdownSkeletonList({ count }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={cls.SkeletonRow} />
            ))}
        </>
    );
}
