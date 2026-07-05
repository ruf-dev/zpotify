import { Toggle } from '@vervstack/chures';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import { useAudioSettings } from '@/entities/audio-settings/useAudioSettings.ts';
import SettingsRow from '@/widgets/UISettings/components/SettingsRow/SettingsRow.tsx';

export default function AudioScreen() {
    const { cacheSongs, setCacheSongs } = useAudioSettings();

    return (
        <div className={cls.SettingsGroup}>
            <SettingsRow
                label="Cache Songs"
                description="Store played songs on this device so they don't need to be downloaded again"
            >
                <Toggle checked={cacheSongs} onChange={setCacheSongs} />
            </SettingsRow>
        </div>
    );
}
