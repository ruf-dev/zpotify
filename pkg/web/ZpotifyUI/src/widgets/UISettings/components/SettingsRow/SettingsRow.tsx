import { ReactNode } from 'react';

import cls from '@/widgets/UISettings/components/SettingsRow/SettingsRow.module.css';

interface SettingsRowProps {
    label: string;
    description?: string;
    children: ReactNode;
}

export default function SettingsRow({ label, description, children }: SettingsRowProps) {
    return (
        <div className={cls.SettingsRowContainer}>
            <div className={cls.SettingInfo}>
                <span className={cls.SettingLabel}>{label}</span>
                {description && (
                    <span className={cls.SettingDescription}>{description}</span>
                )}
            </div>
            {children}
        </div>
    );
}
