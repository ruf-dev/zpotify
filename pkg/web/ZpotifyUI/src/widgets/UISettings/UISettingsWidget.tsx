import { useState } from 'react';
import { Toggle } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';

interface Tab {
    id: string;
    label: string;
    disabled?: boolean;
}

const TABS: Tab[] = [{ id: 'appearance', label: 'Appearance' }];

export default function UISettingsWidget() {
    const [activeTab, setActiveTab] = useState('appearance');

    const dynamicHomePage = useUISettings((s) => s.dynamicHomePage);
    const setDynamicHomePage = useUISettings((s) => s.setDynamicHomePage);

    return (
        <div className={cls.UISettingsWidgetContainer}>
            <nav className={cls.TabSidebar}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={cn(cls.TabItem, {
                            [cls.TabItemActive]: activeTab === tab.id,
                            [cls.TabItemDisabled]: tab.disabled,
                        })}
                        onClick={function handleTabClick() {
                            if (!tab.disabled) setActiveTab(tab.id);
                        }}
                        disabled={tab.disabled}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className={cls.TabContent}>
                {activeTab === 'appearance' && (
                    <div className={cls.SettingsGroup}>
                        <div className={cls.SettingRow}>
                            <div className={cls.SettingInfo}>
                                <span className={cls.SettingLabel}>Dynamic Home Page</span>
                                <span className={cls.SettingDescription}>
                                    Animate and refresh home page content dynamically
                                </span>
                            </div>
                            <Toggle
                                checked={dynamicHomePage}
                                onChange={setDynamicHomePage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
