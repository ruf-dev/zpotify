import { useState, useEffect } from 'react';

import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';
import { HomeSegment } from '@/shared/model/HomeSegments.tsx';
import type { Tab } from '@/components/tabs/SegmentTabBar.tsx';

export function useHomeSegments() {
    const toaster = useToaster();
    const Services = useUser((state) => state.Services);
    const savedIdx = parseInt(localStorage.getItem('zp_tab_idx') || '0', 10);
    const [segments, setSegments] = useState<HomeSegment[]>([]);
    const [activeIdx, setActiveIdx] = useState(!isNaN(savedIdx) ? savedIdx : 0);

    useEffect(() => {
        Services().Settings().ListHomeSegments().then(setSegments).catch(toaster.catch);
    }, []);

    useEffect(() => {
        if (segments.length > 0 && activeIdx >= segments.length) {
            setActiveIdx(0);
        }
    }, [segments]);

    const tabs: Tab[] = segments.map((s) => ({ id: s.id, label: s.label }));

    function handleChange(idx: number) {
        setActiveIdx(idx);
        localStorage.setItem('zp_tab_idx', String(idx));
    }

    return { segments, tabs, activeIdx, handleChange };
}
