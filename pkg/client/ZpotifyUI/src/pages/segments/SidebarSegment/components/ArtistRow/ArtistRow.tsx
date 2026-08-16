import type { CSSProperties } from 'react';
import cn from 'classnames';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import cls from '@/pages/segments/SidebarSegment/components/ArtistRow/ArtistRow.module.css';
import { artistPath } from '@/app/routing/paths.ts';
import { useSidebarUI } from '@/shared/model/sidebarUIStore.ts';

interface ArtistRowProps {
    uuid: string;
    name: string;
    seed: string;
    isCollapsed: boolean;
}

export default function ArtistRow({ uuid, name, seed, isCollapsed }: ArtistRowProps) {
    const navigate = useNavigate();
    const closeDrawer = useSidebarUI((state) => state.closeDrawer);

    function handleClick() {
        if (!uuid) return;
        flushSync(() => closeDrawer());
        navigate(artistPath(uuid));
    }

    return (
        <div className={cn(cls.ArtistRow, isCollapsed && cls.ArtistRowCollapsed)} onClick={handleClick}>
            <div
                className={cn(cls.ArtistAvatar, isCollapsed && cls.ArtistAvatarCollapsed)}
                style={{ '--seed': seed } as CSSProperties}
            >
                {name[0]}
            </div>
            <div className={cn(cls.ArtistInfoWrapper, isCollapsed && cls.ArtistInfoWrapperHidden)}>
                <span className={cls.ArtistName}>{name}</span>
            </div>
        </div>
    );
}
