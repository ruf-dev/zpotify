
export class AudioFile {
    fileId?: string
    durationSec?: number

    constructor(fileId?: string, durationSec?: number) {
        this.fileId = fileId
        this.durationSec = durationSec
    }
}
