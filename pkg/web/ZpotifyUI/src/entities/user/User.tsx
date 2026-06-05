import useUser from '@/entities/user/useUser.ts';

export default function User() {
    const userData = useUser((state) => state.userData);
    return <div>{userData?.username}</div>;
}
