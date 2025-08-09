import {useState} from "react";

export interface User {
    username: string;
}

export default function useUser(): User {
    const [username] = useState<string>("");

    return {
        username,
    }
}
