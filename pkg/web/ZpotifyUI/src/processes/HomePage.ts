import {HomeSegment, PlaylistSegmentInfo} from "@/model/HomeSegments.tsx";
import {BaseService} from "@/processes/BaseService.ts";
import {InitReq} from "@/processes/Api.ts";
import {HomePageSegment, UserAPI} from "@zpotify/api";

export interface ISettingsService {
    ListHomeSegments(): Promise<HomeSegment[]>
}

export class SettingsService extends BaseService implements ISettingsService {
    async ListHomeSegments(): Promise<HomeSegment[]> {
        return this.executeAuthApiCall(async (initReq: InitReq) => {
                return UserAPI
                    .GetUserSettings({}, initReq)
                    .then(r => toHomeSegments((r.settings?.homeSegments || [])))
            }
        )
    }
}


function toHomeSegments(segs: HomePageSegment[]): HomeSegment[] {
    return (segs || [])
        .map(parseHomePageSegment)
        .filter(v=> v != undefined)
}

function parseHomePageSegment(seg: HomePageSegment): HomeSegment | undefined {
    if (seg.playlistSegment && seg.playlistSegment.playlistId) {
        return new PlaylistSegmentInfo(seg.playlistSegment.playlistId)
    }

    return
}

