export function apiPrefix(opts?: options) {
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
