import React from "react";
import cn from "classnames";
import cls from "@/shared/ui/AuthButton.module.css";

interface AuthButtonProps {
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    comingSoon?: boolean;
    className?: string;
}

export default function AuthButton({icon, label, onClick, disabled = false, comingSoon = false, className}: AuthButtonProps) {
    return (
        <button
            className={cn(cls.AuthButton, className, {[cls.disabled]: disabled})}
            onClick={disabled ? undefined : onClick}
        >
            {icon && (
                <span className={cn(cls.Icon, {[cls.disabledIcon]: disabled})}>
                    {icon}
                </span>
            )}
            <span>{label}</span>
            {comingSoon && disabled && (
                <span className={cls.SoonBadge}>soon</span>
            )}
        </button>
    );
}
