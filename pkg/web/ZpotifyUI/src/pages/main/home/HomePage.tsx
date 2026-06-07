import React from 'react';

import cls from '@/pages/main/home/HomePage.module.css';
import SegmentTabBar from '@/components/tabs/SegmentTabBar.tsx';
import SegmentCarousel from '@/components/carousel/SegmentCarousel.tsx';
import { useHomeSegments } from '@/widgets/HomeSegments/useHomeSegments.ts';

export default function HomePage() {
    const { segments, tabs, activeIdx, handleChange } = useHomeSegments();

    const activeTab = tabs[activeIdx];

    function handleTabClick(id: string) {
        const idx = tabs.findIndex((t) => t.id === id);
        if (idx >= 0) handleChange(idx);
    }


    function renderSlide(idx: number): React.ReactNode {
        const segment = segments[idx];
        if (!segment) return null;
        return segment.buildComponent();
    }

    return (
        <div className={cls.HomePage}>
            <div className={cls.ContentArea}>
                {tabs.length > 0 && (
                    <SegmentTabBar
                        tabs={tabs}
                        activeId={activeTab?.id ?? ''}
                        onChange={handleTabClick} />
                )}
                <SegmentCarousel
                    activeIdx={activeIdx}
                    count={segments.length}
                    onChange={handleChange}
                    renderSlide={renderSlide}
                />
            </div>
        </div>
    );
}
