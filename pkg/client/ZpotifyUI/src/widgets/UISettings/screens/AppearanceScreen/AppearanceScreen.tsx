import { Toggle } from '@vervstack/chures';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import SettingsRow from '@/widgets/UISettings/components/SettingsRow/SettingsRow.tsx';

export default function AppearanceScreen() {
    const {
        dynamicHomePage, setDynamicHomePage,
        swipeEnabled, setSwipeEnabled,
        showSidebar, setShowSidebar,
        showPlayerBar, setShowPlayerBar,
        showQueuePanel, setShowQueuePanel,
    } = useUISettings();

    return (
        <div className={cls.SettingsGroup}>
            <SettingsRow
                label="Dynamic Home Page"
                description="Animate and refresh home page content dynamically"
            >
                <Toggle checked={dynamicHomePage} onChange={setDynamicHomePage} />
            </SettingsRow>
            <SettingsRow
                label="Swipe Navigation"
                description="Swipe between segments on the home page"
            >
                <Toggle checked={swipeEnabled} onChange={setSwipeEnabled} />
            </SettingsRow>
            <SettingsRow
                label="Sidebar"
                description="Collapsible left navigation sidebar"
            >
                <Toggle checked={showSidebar} onChange={setShowSidebar} />
            </SettingsRow>
            <SettingsRow
                label="Player Bar"
                description="Full-width bottom player bar"
            >
                <Toggle checked={showPlayerBar} onChange={setShowPlayerBar} />
            </SettingsRow>
            <SettingsRow
                label="Queue Panel"
                description="Slide-in right queue panel"
            >
                <Toggle checked={showQueuePanel} onChange={setShowQueuePanel} />
            </SettingsRow>
        </div>
    );
}
