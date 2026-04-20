import {useState} from "react";

import cls from "@/dialogs/SongEdit/SongEditDialog.module.css";

import Button from "@/components/shared/Button.tsx";
import Input from "@/components/shared/Input.tsx";
import Chip from "@/components/shared/Chip.tsx";

interface SongEditDialogProps {
    path: string;
    initialTitle?: string;
    initialArtists?: string;
    duration?: string;
    size?: string;
}

export default function SongEditDialog({
                                           path,
                                           initialTitle = "Espresso",
                                           initialArtists = "Sabrina Carpenter",
                                           duration = "2:54",
                                           size = "6.7 MB"
                                       }: SongEditDialogProps) {
    const [title, setTitle] = useState(initialTitle);
    const [artists, setArtists] = useState(initialArtists);

    return (
        <div className={cls.SongEditDialog}>
            <div className={cls.PathContainer}>
                {path}
            </div>

            <div className={cls.Form}>
                <Input
                    label="Title"
                    inputValue={title}
                    onChange={setTitle}
                />
                <Input
                    label="Artists"
                    inputValue={artists}
                    onChange={setArtists}
                />
                <div className={cls.Chips}>
                    <Chip value={duration} label="duration"/>
                    <Chip value={size} label="size"/>
                    <Chip value={'hit'}/>
                </div>
            </div>

            <div className={cls.Footer}>
                <Button
                    title="Save"
                    onClick={() => {
                        console.log("Saving...", {title, artists});
                    }}
                />
            </div>
        </div>
    );
}
