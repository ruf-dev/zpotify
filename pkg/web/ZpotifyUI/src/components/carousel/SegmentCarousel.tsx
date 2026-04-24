import {ReactNode, useRef, useEffect} from 'react';
import cn from 'classnames';
import cls from '@/components/carousel/SegmentCarousel.module.css';

interface SegmentCarouselProps {
    activeIdx: number;
    count: number;
    onChange: (idx: number) => void;
    renderSlide: (idx: number, isActive: boolean) => ReactNode;
}

export default function SegmentCarousel({activeIdx, count, onChange, renderSlide}: SegmentCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isProgrammatic = useRef(false);
    const activeIdxRef = useRef(activeIdx);
    activeIdxRef.current = activeIdx;

    useEffect(() => {
        const container = containerRef.current;
        const card = cardRefs.current[activeIdx];
        if (!container || !card) return;

        const containerRect = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const delta = (cardRect.left + cardRect.width / 2) - (containerRect.left + containerRect.width / 2);
        const targetScrollLeft = container.scrollLeft + delta;

        isProgrammatic.current = true;
        container.scrollTo({left: targetScrollLeft, behavior: 'smooth'});
        setTimeout(() => {
            isProgrammatic.current = false;
        }, 450);
    }, [activeIdx]);

    const handleScroll = () => {
        if (isProgrammatic.current) return;
        const container = containerRef.current;
        if (!container) return;

        const containerCx = container.getBoundingClientRect().left + container.offsetWidth / 2;
        let minDist = Infinity;
        let closest = activeIdxRef.current;

        cardRefs.current.forEach((card, i) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const d = Math.abs((rect.left + rect.width / 2) - containerCx);
            if (d < minDist) {
                minDist = d;
                closest = i;
            }
        });

        if (closest !== activeIdxRef.current) onChange(closest);
    };

    return (
        <div
            ref={containerRef}
            className={cls.SegmentCarouselContainer}
            onScroll={handleScroll}
        >
            {
                Array
                    .from({length: count})
                    .map((_, idx) => {
                        const offset = idx - activeIdx;
                        const isActive = offset === 0;
                        const isAdjacent = Math.abs(offset) === 1;
                        const opacity = isActive ? 1 : isAdjacent ? 0.38 : 0.15;
                        const scale = isActive ? 1 : 0.965;

                        return (
                            <div
                                key={idx}
                                ref={el => {
                                    cardRefs.current[idx] = el;
                                }}
                                className={cn(cls.Card, {
                                    [cls.Active]: isActive,
                                })}
                                style={{
                                    opacity,
                                    transform: `scale(${scale})`,
                                    transition: 'opacity 0.22s ease, transform 0.34s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onClick={() => {
                                    if (!isActive) onChange(idx);
                                }}
                            >
                                <div className={
                                    cn(cls.CardContent, {
                                        [cls.Scrollable]: isActive,
                                    })}>
                                    {renderSlide(idx, isActive)}
                                </div>
                            </div>
                        );
                    })}
        </div>
    );
}
