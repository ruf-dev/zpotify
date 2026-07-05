import { useState } from 'react';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import AppearanceScreen from '@/widgets/UISettings/screens/AppearanceScreen/AppearanceScreen.tsx';
import SettingsTabButton, { Tab } from '@/widgets/UISettings/components/SettingsTabButton/SettingsTabButton.tsx';

const TABS: Tab[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'server', label: 'Server', disabled: true },
];

export default function UISettingsWidget() {
    const [activeTab, setActiveTab] = useState('appearance');

    function handleTabSelect(id: string) {
        setActiveTab(id);
    }

    return (
        <div className={cls.UISettingsWidgetContainer}>
            <nav className={cls.TabSidebar}>
                {TABS.map((tab) => (
                    <SettingsTabButton
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        onSelect={handleTabSelect}
                    />
                ))}
            </nav>

            <div className={cls.TabContent}>
                {activeTab === 'appearance' && <AppearanceScreen />}
            </div>
        </div>
    );
}
