import { AnimatePresence, motion } from 'framer-motion';

import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import cls from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.module.css';

export interface EditableArtistPickerContext {
    displayName: string;
    artists: ArtistItem[];
    isEditing: boolean;
    onChange: (artists: ArtistItem[]) => void;
    loadOptions: (q: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

const FADE_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const;
const HEIGHT_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] } as const;

export default function EditableArtistPicker({
    displayName,
    artists,
    isEditing,
    onChange,
    loadOptions,
    onCreateArtist,
}: EditableArtistPickerContext) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
                <motion.div
                    key="picker"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={HEIGHT_TRANSITION}
                    style={{ overflow: 'hidden' }}
                >
                    <ArtistChipsField
                        artists={artists}
                        onChange={onChange}
                        loadOptions={loadOptions}
                        onCreateArtist={onCreateArtist}
                        preloadedOptions={artists}
                        dense
                    />
                </motion.div>
            ) : (
                <motion.span
                    key="name"
                    className={cls.ArtistName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={FADE_TRANSITION}
                >
                    {displayName}
                </motion.span>
            )}
        </AnimatePresence>
    );
}
