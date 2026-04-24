import React, {JSX} from "react";
import PlaylistHomeSegment from "@/pages/home/segments/PlaylistHomeSegment.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import ManagementHomeSegment from "@/pages/home/segments/ManagementHomeSegment.tsx";

export type HomeSegmentProps = {
    audioPlayer: AudioPlayer;
    user: User;
}

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

    buildComponent({audioPlayer, user}: HomeSegmentProps): React.JSX.Element {
        return (<PlaylistHomeSegment
            audioPlayer={audioPlayer}
            user={user}
            playlistUuid={this.playlistUuid}
        />);
    }
}

export class ManagementSegmentInfo implements HomeSegment {
    readonly id = 'management';
    readonly label = 'management';

    buildComponent({audioPlayer, user}: HomeSegmentProps): React.JSX.Element {
        return (<ManagementHomeSegment
            audioPlayer={audioPlayer}
            user={user}
        />);
    }
}
