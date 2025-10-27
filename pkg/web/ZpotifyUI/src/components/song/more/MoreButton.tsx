import cls from "@/components/song/more/MoreButton.module.scss"

import MoreDots from "@/assets/MoreDots.tsx";
import {useEffect, useRef, useState} from "react";
import cn from "classnames";
import Menu, {MenuOption} from "@/components/menu/Menu.tsx";

interface MoreButtonProps {
    ops: MenuOption[];

    onOpen?: () => void;
    onClose?: () => void;
}

export default function MoreButton({onOpen, onClose, ops}: MoreButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (isMenuOpen && onOpen) {
            onOpen()
        } else if (onClose) {
            onClose()
        }
    }, [isMenuOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (buttonRef.current &&
                // @ts-ignore
                buttonRef.current.contains(event.target)) {
                return
            }

            if (dropdownRef.current &&
                // @ts-ignore
                !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        // Bind the listener
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Clean up the listener on unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div
            className={cls.MoreButtonContainer}
            onClick={(event) => {
                event.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
            }}
        >
            <div
                ref={dropdownRef}
                className={cn(cls.SubMenuContainer, {
                    [cls.open]: isMenuOpen,
                })}
            >
                <Menu options={ops}/>
            </div>

            <div ref={buttonRef}>
                <MoreDots/>
            </div>
        </div>
    )
}
