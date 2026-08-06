import { Button, ConfirmDialog, Toggle } from '@vervstack/chures';

import cls from '@/widgets/UISettings/UISettingsWidget.module.css';
import audioScreenCls from '@/widgets/UISettings/screens/AudioScreen/AudioScreen.module.css';
import { useAudioSettings } from '@/entities/audio-settings/useAudioSettings.ts';
import SettingsRow from '@/widgets/UISettings/components/SettingsRow/SettingsRow.tsx';
import CachedSongsAccordion from '@/widgets/CachedSongsAccordion/CachedSongsAccordion.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useAudioCacheStore } from '@/shared/model/audioCacheStore.ts';
import { useCoverCacheStore } from '@/shared/model/coverCacheStore.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export default function AudioScreen() {
    const { cacheSongs, setCacheSongs } = useAudioSettings();
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();
    const cachedCount = useAudioCacheStore((state) => state.cachedUrls.size);

    function handleClearCache() {
        async function handleConfirm() {
            await useAudioCacheStore.getState().clearAll();
            toaster.bake({
                title: 'Cache cleared',
                description: 'All cached songs have been removed from this device',
                level: 'Info',
            });
            CloseDialog();
        }

        OpenDialog(
            <ConfirmDialog
                title="Clear cache"
                message="This will remove all songs downloaded for offline playback on this device."
                confirmLabel="Clear cache"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    function handleClearImageCache() {
        async function handleConfirm() {
            await useCoverCacheStore.getState().clearAll();
            toaster.bake({
                title: 'Image cache cleared',
                description: 'All cached cover images have been removed from this device',
                level: 'Info',
            });
            CloseDialog();
        }

        OpenDialog(
            <ConfirmDialog
                title="Clear image cache"
                message="This will remove all cover images cached on this device. They will be re-downloaded as needed."
                confirmLabel="Clear image cache"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    return (
        <div className={cls.SettingsGroup}>
            <SettingsRow
                label="Cache Songs"
                description="Store played songs on this device so they don't need to be downloaded again"
            >
                <Toggle checked={cacheSongs} onChange={setCacheSongs} />
            </SettingsRow>

            {cachedCount === 0 ? (
                <p className={audioScreenCls.EmptyCacheState}>No songs cached</p>
            ) : (
                <>
                    <SettingsRow label="Clear Cache" description="Remove all downloaded songs from this device">
                        <Button variant="danger" onClick={handleClearCache}>
                            Clear Cache
                        </Button>
                    </SettingsRow>

                    <CachedSongsAccordion />
                </>
            )}

            <SettingsRow label="Clear Image Cache" description="Remove all cached cover images from this device">
                <Button variant="danger" onClick={handleClearImageCache}>
                    Clear Image Cache
                </Button>
            </SettingsRow>
        </div>
    );
}
