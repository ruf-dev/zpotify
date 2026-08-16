import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';

import { useIsMobile } from '@/shared/lib/useIsMobile.ts';

interface MediaQueryListStub {
    matches: boolean;
    media: string;
    addEventListener: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
    removeEventListener: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
    dispatchChange: (matches: boolean) => void;
}

function stubMatchMedia(initialMatches: boolean): MediaQueryListStub {
    let listeners: Array<(e: MediaQueryListEvent) => void> = [];

    const stub: MediaQueryListStub = {
        matches: initialMatches,
        media: '(orientation: portrait)',
        addEventListener: (type, listener) => {
            if (type === 'change') listeners.push(listener);
        },
        removeEventListener: (type, listener) => {
            if (type === 'change') listeners = listeners.filter((l) => l !== listener);
        },
        dispatchChange: (matches) => {
            stub.matches = matches;
            const event = { matches } as MediaQueryListEvent;
            listeners.forEach((listener) => listener(event));
        },
    };

    // jsdom does not implement window.matchMedia natively, so it must be defined outright
    // rather than spied on (see SegmentCarousel.test.tsx for the same constraint).
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockReturnValue(stub),
    });

    return stub;
}

describe('useIsMobile', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('returns the initial matchMedia value', () => {
        stubMatchMedia(true);

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('reacts to a matchMedia change event', () => {
        const stub = stubMatchMedia(false);

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        act(() => {
            stub.dispatchChange(true);
        });

        expect(result.current).toBe(true);
    });
});
