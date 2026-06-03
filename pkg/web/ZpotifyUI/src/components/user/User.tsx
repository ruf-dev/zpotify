import useUser from "@/hooks/user/User.ts";

export default function User() {
    const userData = useUser(state => state.userData);
    return (
        <div>
            {userData?.username}
        </div>
    )
}
