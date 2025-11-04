import React, {JSX} from "react";
import DisplayPlaylistSegment from "@/pages/home/segments/DisplayPlaylistSegment.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

export type HomeSegmentProps = {
    audioPlayer: AudioPlayer;
    user: User;
}

export interface HomeSegment {
    buildComponent(props: HomeSegmentProps): JSX.Element
}


export class PlaylistSegmentInfo implements HomeSegment {
    private playlistUuid: string

    constructor(playlistId: string) {
        this.playlistUuid =playlistId;
    }

    buildComponent({audioPlayer, user}: HomeSegmentProps): React.JSX.Element {
        console.log("loading playlist")
        return (<DisplayPlaylistSegment
            audioPlayer={audioPlayer}
            user={user}
            playlistUuid={this.playlistUuid}
            />);
    }
}
