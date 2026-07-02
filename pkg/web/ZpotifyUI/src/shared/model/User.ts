import type { Permissions } from '@/app/api/zpotify';

export type UserInfo = {
    username: string;
    permissions: UserPermissions;
    pictureUrl?: string;
    likedPlaylistId: string;
};

export type UserPermissions = Permissions;

export type SongListPermissions = {
    canDelete: boolean;
};
