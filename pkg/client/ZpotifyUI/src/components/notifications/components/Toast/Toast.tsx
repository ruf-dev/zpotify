import cn from 'classnames';
import { useEffect, useState } from 'react';

import cls from '@/components/notifications/components/Toast/Toast.module.css';
import { Toast as ToastProp, useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export default function Toast({ title, description, isDismissable }: ToastProp) {
    const [isLeaving, setIsLeaving] = useState(false);
    const toaster = useToaster();

    useEffect(() => {
        return () => {
            setIsLeaving(true);
        };
    }, []);

    return (
        <div
            className={cn(cls.Toast, {
                [cls.error]: title === 'Error',
                [cls.warn]: title === 'Warn',
                [cls.info]: title == undefined || title === 'Info',

                [cls.slideIn]: !isLeaving,
                [cls.slideOut]: isLeaving,
            })}
        >
            <div>{title}</div>
            <div className={cls.Description}> {description}</div>

            {isDismissable && (
                <div className={cls.DismissButton} onClick={() => toaster.dismiss(title)}>
                    -
                </div>
            )}
        </div>
    );
}
