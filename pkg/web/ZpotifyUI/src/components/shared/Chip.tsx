import React from "react";
import cn from "classnames";

import cls from "@/components/shared/Chip.module.css";

interface ChipProps {
    label: string;
    className?: string;
}

export default function Chip({ label, className }: ChipProps) {
    return (
        <div className={cn(cls.Chip, className)}>
            {label}
        </div>
    );
}
