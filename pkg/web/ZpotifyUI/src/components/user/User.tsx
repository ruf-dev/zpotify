import {User as UserInfo} from "@/hooks/user/user.ts";

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
