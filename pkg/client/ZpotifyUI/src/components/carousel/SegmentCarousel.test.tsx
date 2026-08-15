import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';

// jsdom does not implement window.matchMedia, but useUISettings computes `isMobile` via
// matchMedia at module-load time. vi.hoisted() is physically hoisted above the imports below
// by Vitest's transform, so this stub is in place before the store module ever evaluates.
vi.hoisted(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

import SegmentCarousel from '@/components/carousel/SegmentCarousel.tsx';
import cls from '@/components/carousel/SegmentCarousel.module.css';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';

interface StubRect {
    left: number;
    width: number;
}

function stubRect(el: Element, rect: StubRect) {
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        left: rect.left,
        width: rect.width,
        right: rect.left + rect.width,
        top: 0,
        bottom: 0,
        height: 0,
        x: rect.left,
        y: 0,
        toJSON() {
            return this;
        },
    } as DOMRect);
}

function stubOffsetWidth(el: HTMLElement, width: number) {
    Object.defineProperty(el, 'offsetWidth', { configurable: true, value: width });
}

function renderCarousel(activeIdx: number, onChange: (idx: number) => void) {
    return render(
        <SegmentCarousel
            activeIdx={activeIdx}
            count={3}
            onChange={onChange}
            renderSlide={(idx) => <div>{`slide-${idx}`}</div>}
        />,
    );
}

describe('SegmentCarousel', () => {
    beforeEach(() => {
        useUISettings.setState({ swipeEnabled: true });
        Element.prototype.scrollTo = vi.fn();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('commits the closest card on user scroll without re-triggering scrollTo', async () => {
        const onChange = vi.fn();
        const { container } = renderCarousel(0, onChange);

        // Mount triggers the recentering effect, which sets isProgrammatic and clears it via a
        // setTimeout(0) (isInitial mount uses an instant, zero-delay reset). Flush that macrotask
        // before dispatching a scroll event, otherwise commitClosestCard bails out early.
        await new Promise((resolve) => setTimeout(resolve, 0));

        const scrollContainer = container.querySelector(`.${cls.SegmentCarouselContainer}`) as HTMLDivElement;
        const cards = container.querySelectorAll(`.${cls.Card}`);

        // containerCx (per commitClosestCard) = container rect.left + container.offsetWidth / 2 = 300 + 200 = 500
        stubRect(scrollContainer, { left: 300, width: 400 });
        stubOffsetWidth(scrollContainer, 400);
        // card centers: card0 = 750+250=1000 (dist 500), card1 = 300+200=500 (dist 0), card2 = 1250+250=1500 (dist 1000)
        stubRect(cards[0], { left: 750, width: 500 });
        stubRect(cards[1], { left: 300, width: 400 });
        stubRect(cards[2], { left: 1250, width: 500 });

        const scrollToSpy = Element.prototype.scrollTo as ReturnType<typeof vi.fn>;
        scrollToSpy.mockClear();

        scrollContainer.dispatchEvent(new Event('scroll'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1);
        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('commits the closest card on native scrollend without re-triggering scrollTo', async () => {
        const onChange = vi.fn();
        const { container } = renderCarousel(0, onChange);

        // See the previous test: flush the mount effect's setTimeout(0) isProgrammatic reset.
        await new Promise((resolve) => setTimeout(resolve, 0));

        const scrollContainer = container.querySelector(`.${cls.SegmentCarouselContainer}`) as HTMLDivElement;
        const cards = container.querySelectorAll(`.${cls.Card}`);

        // containerCx = 0 + 400/2 = 200
        stubRect(scrollContainer, { left: 0, width: 400 });
        stubOffsetWidth(scrollContainer, 400);
        // card centers: card0 = 1600+200=1800 (dist 1600), card1 = 1200+200=1400 (dist 1200), card2 = 200+200=400 (dist 200)
        stubRect(cards[0], { left: 1600, width: 400 });
        stubRect(cards[1], { left: 1200, width: 400 });
        stubRect(cards[2], { left: 200, width: 400 });

        const scrollToSpy = Element.prototype.scrollTo as ReturnType<typeof vi.fn>;
        scrollToSpy.mockClear();

        scrollContainer.dispatchEvent(new Event('scrollend'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(2);
        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('re-centers via scrollTo when activeIdx changes externally (e.g. a tab click)', () => {
        const onChange = vi.fn();
        const { rerender, container } = renderCarousel(0, onChange);

        const scrollContainer = container.querySelector(`.${cls.SegmentCarouselContainer}`) as HTMLDivElement;
        const cards = container.querySelectorAll(`.${cls.Card}`);
        stubRect(scrollContainer, { left: 0, width: 400 });
        cards.forEach((card, i) => stubRect(card, { left: i * 400, width: 400 }));

        const scrollToSpy = Element.prototype.scrollTo as ReturnType<typeof vi.fn>;
        scrollToSpy.mockClear();

        rerender(
            <SegmentCarousel
                activeIdx={2}
                count={3}
                onChange={onChange}
                renderSlide={(idx) => <div>{`slide-${idx}`}</div>}
            />,
        );

        expect(scrollToSpy).toHaveBeenCalledTimes(1);
    });

    it('ignores scroll events when swipe is disabled', () => {
        useUISettings.setState({ swipeEnabled: false });
        const onChange = vi.fn();
        const { container } = renderCarousel(0, onChange);

        const scrollContainer = container.querySelector(`.${cls.SegmentCarouselContainer}`) as HTMLDivElement;
        scrollContainer.dispatchEvent(new Event('scroll'));

        expect(onChange).not.toHaveBeenCalled();
    });
});
