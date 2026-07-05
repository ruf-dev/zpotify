import cn from 'classnames';

import cls from '@/components/tabs/SegmentTabBar.module.css';

export interface Tab {
    id: string;
    label: string;
}

interface SegmentTabBarProps {
    tabs: Tab[];
    activeId: string;
    onChange: (id: string) => void;
}

export default function SegmentTabBar({ tabs, activeId, onChange }: SegmentTabBarProps) {
    return (
        <div className={cls.SegmentTabBarContainer}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={cn(cls.Tab, { [cls.Active]: tab.id === activeId })}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
