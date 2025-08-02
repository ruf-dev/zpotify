import {useState} from "react";
import cn from 'classnames';

import cls from "@/components/player/buttons/PlayPauseButton.module.css";

export interface PlayPauseButtonProps {
    onClick: () => void;
}

export default function PlayPauseButton({onClick}: PlayPauseButtonProps) {
    const [isActive, setIsActive] = useState(false);

    function onClickInternal() {
        setIsActive(!isActive)
        onClick()
    }

    return (
        <div
            className={cls.PlayPauseWrapper}
            onClick={onClickInternal}
        >
            <div className={
                cn(cls.Stick, cls.Stick1, {
                    [cls.Active]: isActive,
                    [cls.Inactive]: !isActive
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick2, {
                    [cls.Active]: isActive,
                    [cls.Inactive]: !isActive
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick3, {
                    [cls.Active]: isActive,
                    [cls.Inactive]: !isActive
                })
            }/>
        </div>
    )
}
