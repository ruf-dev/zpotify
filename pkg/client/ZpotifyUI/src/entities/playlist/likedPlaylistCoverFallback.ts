export interface LikedPlaylistCoverFallback {
    avatarFallbackUrl?: string;
    avatarFallbackLabel?: string;
}

// The user's own "Likes" playlist defaults to their avatar (with the playlist
// name overlaid) instead of the generic generative cover, as long as they
// haven't picked a custom cover for it.
export function getLikedPlaylistCoverFallback(
    playlistUuid: string | undefined,
    playlistName: string | undefined,
    likedPlaylistId: string | undefined,
    userAvatarUrl: string | undefined,
): LikedPlaylistCoverFallback {
    if (!playlistUuid || !likedPlaylistId || playlistUuid !== likedPlaylistId || !userAvatarUrl) {
        return {};
    }

    return { avatarFallbackUrl: userAvatarUrl, avatarFallbackLabel: playlistName };
}
