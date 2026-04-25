import {AudioFile} from "@/model/AudioFile.ts";

enum UriPath {
    Upload = '/wapi/files/upload'
}

export interface WebApi {
    Upload(file: AudioFile): Promise<string>
}
