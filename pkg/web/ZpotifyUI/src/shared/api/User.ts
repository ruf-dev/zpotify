import { InitReq, MeRequest, MeResponse, UserAPI } from '@/app/api/zpotify';
import { UserInfo } from '@/shared/model/User.ts';
import { BaseService } from '@/shared/api/BaseService.ts';
import { ServiceError, WithTitle } from '@/shared/api/Errors.ts';

export default class UserService extends BaseService {
    public async GetMe(): Promise<UserInfo> {
        const req: MeRequest = {};

        return this.executeAuthApiCall((initReq: InitReq) => {
            return UserAPI.Me(req, initReq);
        }).then((r: MeResponse) => {
            if (!r.userData) {
                throw new ServiceError(WithTitle('empty user data in GetMe response'));
            }

            return {
                username: r.userData.username,
                permissions: r.permissions,
                pictureUrl: r.userData.pictureUrl,
            } as UserInfo;
        });
    }
}

export const userService = new UserService();
