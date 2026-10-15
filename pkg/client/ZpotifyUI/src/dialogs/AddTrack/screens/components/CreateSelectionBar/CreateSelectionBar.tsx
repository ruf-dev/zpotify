import { useState } from 'react';
import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/components/CreateSelectionBar/CreateSelectionBar.module.css';

interface Props {
    selectedCount: number;
    onCreateSingle: () => void;
    onCreatePlaylist: () => void;
}

type Mode = 'single' | 'playlist';

function modeFor(selectedCount: number): Mode | null {
    if (selectedCount === 0) return null;
    return selectedCount === 1 ? 'single' : 'playlist';
}

export default function CreateSelectionBar({ selectedCount, onCreateSingle, onCreatePlaylist }: Props) {
    const [lastMode, setLastMode] = useState<Mode>('single');
    const currentMode = modeFor(selectedCount);
    const isVisible = currentMode !== null;
    const mode = currentMode ?? lastMode;

    if (currentMode !== null && currentMode !== lastMode) {
        setLastMode(currentMode);
    }

    return (
        <div className={cn(cls.CreateSelectionBarContainer, isVisible && cls.Visible)} aria-hidden={!isVisible}>
            <div className={cls.Inner}>
                <div className={cls.Content}>
                    <Button variant="primary" onClick={mode === 'single' ? onCreateSingle : onCreatePlaylist}>
                        {mode === 'single' ? 'Create single' : 'Create playlist'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
