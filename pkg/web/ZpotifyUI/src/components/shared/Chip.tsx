import React from "react";
import cn from "classnames";

import cls from "@/components/shared/Chip.module.css";

interface ChipProps {
    value: React.ReactNode;
    label?: string;
    className?: string;
    onClick?: () => void;
}

export default function Chip({ value, label, className, onClick }: ChipProps) {
    return (
        <div
            className={cn(cls.ChipContainer, {
                [cls.Clickable]: !!onClick
            })}
            onClick={onClick}
        >
            <div className={cn(cls.Chip, className)}>
                {value}
            </div>
            {label && (
                <div className={cls.Label}>
                    {label}
                </div>
            )}
        </div>
    );
}
