import React, { JSX } from 'react';

import PlaylistHomeSegment from '@/widgets/PlaylistHomeSegment/PlaylistHomeSegment.tsx';

import ManagementHomeSegment from '@/widgets/ManagementHomeSegment/ManagementHomeSegment.tsx';
import PlaylistsLibrarySegment from '@/widgets/PlaylistsLibrarySegment/PlaylistsLibrarySegment.tsx';

export interface HomeSegment {
    id: string;
    label: string;
    buildComponent(): JSX.Element;
}

export class PlaylistSegmentInfo implements HomeSegment {
    readonly id: string;
    readonly label = 'playlist';
    private readonly playlistUuid: string;

    constructor(playlistId: string) {
        this.playlistUuid = playlistId;
        this.id = playlistId;
    }

    buildComponent(): React.JSX.Element {
        return <PlaylistHomeSegment playlistUuid={this.playlistUuid} />;
    }
}

export class ManagementSegmentInfo implements HomeSegment {
    readonly id = 'management';
    readonly label = 'management';

    buildComponent(): React.JSX.Element {
        return <ManagementHomeSegment />;
    }
}

export class LibrarySegmentInfo implements HomeSegment {
    readonly id = 'library';
    readonly label = 'playlists';

    buildComponent(): React.JSX.Element {
        return <PlaylistsLibrarySegment/>;
    }
}
