import React from "react";
import cn from "classnames";

import cls from "@/components/shared/Chip.module.css";

interface ChipProps {
    value: string;
    label?: string;
    className?: string;
}

export default function Chip({ value, label, className }: ChipProps) {
    return (
        <div className={cls.ChipContainer}>
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
