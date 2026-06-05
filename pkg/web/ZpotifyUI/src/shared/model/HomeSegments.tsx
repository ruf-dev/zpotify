import React, { JSX } from 'react';

import PlaylistHomeSegment from '@/widgets/PlaylistHomeSegment/PlaylistHomeSegment.tsx';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';
import ManagementHomeSegment from '@/widgets/ManagementHomeSegment/ManagementHomeSegment.tsx';

export type HomeSegmentProps = {
    audioPlayer: AudioPlayer;
};

export interface HomeSegment {
    id: string;
    label: string;
    buildComponent(props: HomeSegmentProps): JSX.Element;
}

export class PlaylistSegmentInfo implements HomeSegment {
    readonly id: string;
    readonly label = 'playlist';
    private readonly playlistUuid: string;

    constructor(playlistId: string) {
        this.playlistUuid = playlistId;
        this.id = playlistId;
    }

    buildComponent({ audioPlayer }: HomeSegmentProps): React.JSX.Element {
        return <PlaylistHomeSegment audioPlayer={audioPlayer} playlistUuid={this.playlistUuid} />;
    }
}

export class ManagementSegmentInfo implements HomeSegment {
    readonly id = 'management';
    readonly label = 'management';

    buildComponent({ audioPlayer }: HomeSegmentProps): React.JSX.Element {
        return <ManagementHomeSegment audioPlayer={audioPlayer} />;
    }
}
