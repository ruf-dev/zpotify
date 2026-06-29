import {type ComponentType} from 'react';
import cls from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.module.css';
import type {LibraryItem} from '@/widgets/PlaylistsLibrarySegment/model.ts';
import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import cn from "classnames";
import {useUISettings} from "@/entities/ui-settings/useUISettings.ts";

interface Props {
    items: LibraryItem[];
}

function chooseComponent(kind: LibraryItem['kind']): ComponentType<LibraryItem> {
    if (kind === 'album') return AlbumCard as ComponentType<LibraryItem>;
    return PlaylistCardWide as ComponentType<LibraryItem>;
}

export default function LibraryGridScreen({items}: Props) {
    const uiSettings = useUISettings();

    if (items.length === 0) {
        return (
            <div className={cls.PlaylistsLibrarySegmentContainer}>
                <span className={cls.Empty}>No playlists yet</span>
            </div>
        );
    }

    return (
        <div className={cls.PlaylistsLibrarySegmentContainer}>
            <div className={cn(cls.Grid, {
                [cls.smallGridBox]: !uiSettings.swipeEnabled,
                [cls.bigGridBox]: uiSettings.swipeEnabled
            })}>
                {items.map((item) => {
                    const Component = chooseComponent(item.kind);
                    return <Component key={item.uuid} {...item} />;
                })}
            </div>
        </div>
    );
}
