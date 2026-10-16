import cn from 'classnames';

import cls from '@/pages/storages/components/StorageRow/components/TestSpinner/TestSpinner.module.css';

interface Props {
    isActive: boolean;
}

export default function TestSpinner({ isActive }: Props) {
    return (
        <span className={cn(cls.TestSpinnerContainer, isActive && cls.Active)}>
            <span className={cls.Spinner} />
        </span>
    );
}
