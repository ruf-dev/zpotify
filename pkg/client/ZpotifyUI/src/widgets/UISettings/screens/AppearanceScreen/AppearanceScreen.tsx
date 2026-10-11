import { useEffect, useState } from 'react';
import { Toggle } from '@vervstack/chures';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import {
    clipboardPermissionState,
    clipboardSupport,
    readClipboardText,
    type ClipboardSupport,
} from '@/features/upload/magnetLink.ts';
import SettingsRow from '@/widgets/UISettings/components/SettingsRow/SettingsRow.tsx';

export default function AppearanceScreen() {
    const {
        dynamicHomePage,
        setDynamicHomePage,
        swipeEnabled,
        setSwipeEnabled,
        showSidebar,
        setShowSidebar,
        showPlayerBar,
        setShowPlayerBar,
        isClipboardMagnetPromptEnabled,
        setClipboardMagnetPromptEnabled,
    } = useUISettings();
    const [support, setSupport] = useState<ClipboardSupport>('none');

    useEffect(() => {
        clipboardSupport().then(setSupport);
    }, []);

    function handleClipboardMagnetPromptToggle(isEnabled: boolean) {
        setClipboardMagnetPromptEnabled(isEnabled);
        if (!isEnabled) return;

        clipboardPermissionState().then((state) => {
            if (state !== 'granted') return readClipboardText();
        });
    }

    return (
        <div className={cls.SettingsGroup}>
            <SettingsRow label="Dynamic Home Page" description="Animate and refresh home page content dynamically">
                <Toggle checked={dynamicHomePage} onChange={setDynamicHomePage} />
            </SettingsRow>
            <SettingsRow label="Swipe Navigation" description="Swipe between segments on the home page">
                <Toggle checked={swipeEnabled} onChange={setSwipeEnabled} />
            </SettingsRow>
            <SettingsRow label="Sidebar" description="Collapsible left navigation sidebar">
                <Toggle checked={showSidebar} onChange={setShowSidebar} />
            </SettingsRow>
            <SettingsRow label="Player Bar" description="Full-width bottom player bar">
                <Toggle checked={showPlayerBar} onChange={setShowPlayerBar} />
            </SettingsRow>
            {support === 'persistent' && (
                <SettingsRow
                    label="Detect magnet links in clipboard"
                    description="Offer to import a magnet link when you return to the app with one copied"
                >
                    <Toggle checked={isClipboardMagnetPromptEnabled} onChange={handleClipboardMagnetPromptToggle} />
                </SettingsRow>
            )}
        </div>
    );
}
