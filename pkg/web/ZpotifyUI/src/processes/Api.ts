export interface InitReq {
    pathPrefix: string,
    headers: {
        "Grpc-Metadata-Authorization": string,
    },
}

export function apiPrefix(opts?: options): InitReq {
    return {
        pathPrefix: import.meta.env.VITE_ZPOTIFY_API,
        headers: {
            "Grpc-Metadata-Authorization": opts ? opts.accessToken : "",
        }
    }
}

export type options = {
    accessToken: string
}

