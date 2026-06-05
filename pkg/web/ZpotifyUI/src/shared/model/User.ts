import { Permissions } from '@/app/api/zpotify';

export type UserInfo = {
    username: string;
    permissions: UserPermissions;
    pictureUrl?: string;
};

export type UserPermissions = Permissions;

export type SongListPermissions = {
    canDelete: boolean;
};
