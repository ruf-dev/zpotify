import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import cls from '@/entities/song/more/MoreButton.module.css';
import MoreDots from '@/assets/MoreDots.tsx';
import Menu, { MenuOption } from '@/components/menu/Menu.tsx';

interface MoreButtonProps {
    ops: MenuOption[];

    onOpen?: () => void;
    onClose?: () => void;
}

export default function MoreButton({ onOpen, onClose, ops }: MoreButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isMenuOpen && onOpen) onOpen();
        else if (onClose) onClose();
    }, [isMenuOpen]);

    useEffect(() => {
        function handleClickOutside(event: globalThis.MouseEvent) {
            const target = event.target as Node;
            if (buttonRef.current?.contains(target)) return;
            if (!dropdownRef.current?.contains(target)) setIsMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleToggle(event: ReactMouseEvent) {
        event.stopPropagation();
        if (!isMenuOpen) setMenuRect(buttonRef.current?.getBoundingClientRect() ?? null);
        setIsMenuOpen((prev) => !prev);
    }

    return (
        <div ref={buttonRef} className={cls.MoreButtonContainer} onClick={handleToggle}>
            <MoreDots />
            {isMenuOpen &&
                menuRect &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={cls.DropdownMenu}
                        style={{
                            position: 'fixed',
                            top: menuRect.bottom + 4,
                            right: window.innerWidth - menuRect.right,
                        }}
                    >
                        <Menu options={ops} />
                    </div>,
                    document.body,
                )}
        </div>
    );
}
