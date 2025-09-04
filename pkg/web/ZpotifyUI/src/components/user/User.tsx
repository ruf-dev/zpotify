import {User as UserInfo} from "@/hooks/user/User.ts";

interface UserProps {
    user: UserInfo
}

export default function User({user}: UserProps) {
    return (
        <div>
            {user.userData?.username}
        </div>
    )
}
