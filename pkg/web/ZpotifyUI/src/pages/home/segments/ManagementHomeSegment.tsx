import cls from "@/pages/home/segments/ManagementHomeSegment.module.css"

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import cn from "classnames";

interface ManagementHomeSegmentProps {
    audioPlayer: AudioPlayer;
    user: User;
}

export default function ManagementHomeSegment({}: ManagementHomeSegmentProps) {


    return (
        <div className={cls.ManagementHomeSegmentContainer}>
            <DisplayKeys/>
        </div>
    )
}


function DisplayKeys() {
    return (
        <div className={cls.KeysContainer}>
            <div className={cls.Row}>
                <div
                    className={cls.Card}
                >
                    New playlist
                </div>
                <div
                    className={cn(cls.Card, {
                        [cls.inactive]: true,
                    })}
                    data-tooltip-id={'root-tooltip'}
                    data-tooltip-content={'Not available now'}
                >
                    Edit home segments
                </div>
            </div>
            <div className={cls.Row}>
                <div className={cn(cls.Card, {
                    [cls.inactive]: true,
                })}
                     data-tooltip-id={'root-tooltip'}
                     data-tooltip-content={'Not available now'}
                >
                    Upload songs
                </div>
                <div className={cn(cls.Card, {
                    [cls.inactive]: true,
                })}
                     data-tooltip-id={'root-tooltip'}
                     data-tooltip-content={'Not available now'}
                >
                    Search
                </div>
            </div>
        </div>)
}
