import cn from 'classnames';

import cls from './SettingsTabButton.module.css';

export interface Tab {
    id: string;
    label: string;
    disabled?: boolean;

}

export interface SettingsTabButtonProps {
    tab: Tab;
    isActive: boolean;
    onSelect: (id: string) => void;
}

export default function SettingsTabButton({ tab, isActive, onSelect }: SettingsTabButtonProps) {
    function handleClick() {
        if (!tab.disabled) onSelect(tab.id);
    }

    return (
        <button
            className={cn(cls.TabItem, {
                [cls.TabItemActive]: isActive,
                [cls.TabItemDisabled]: tab.disabled,
            })}
            onClick={handleClick}
            disabled={tab.disabled}
        >
            {tab.label}
        </button>
    );
}
