import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

vi.mock('@/widgets/PlaylistScreen/components/TrackRow/TrackRow.tsx', () => ({
    default: (props: {
        song: { id?: string };
        isHighlighted?: boolean;
        rowRef?: (el: HTMLDivElement | null) => void;
    }) => (
        <div
            ref={props.rowRef}
            data-testid={`row-${props.song.id}`}
            data-highlighted={props.isHighlighted ? 'true' : 'false'}
        />
    ),
}));

import MainContent from '@/widgets/PlaylistScreen/components/MainContent/MainContent.tsx';
import type { SongBase } from '@/app/api/zpotify';

function makeSong(id: string): SongBase {
    return { id, title: `Song ${id}`, filePath: `/files/${id}.mp3`, durationSec: 180, artists: [] };
}

describe('MainContent highlight-on-open', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('scrolls to and highlights the track matching highlightTrackId, then clears the highlight after the timeout', () => {
        vi.useFakeTimers();
        const scrollIntoViewSpy = vi.fn();
        Element.prototype.scrollIntoView = scrollIntoViewSpy;
        const songs = [makeSong('1'), makeSong('2'), makeSong('3')];

        render(
            <MainContent
                songs={songs}
                currentTrackPath={null}
                isAudioPlaying={false}
                isAudioLoading={false}
                onPlaySong={vi.fn()}
                onReorder={vi.fn()}
                username="alex"
                highlightTrackId="2"
            />,
        );

        const target = screen.getByTestId('row-2');
        expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
        expect(target.getAttribute('data-highlighted')).toBe('true');
        expect(screen.getByTestId('row-1').getAttribute('data-highlighted')).toBe('false');

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        expect(target.getAttribute('data-highlighted')).toBe('false');
    });

    it('does not scroll or highlight anything when highlightTrackId is absent', () => {
        const scrollIntoViewSpy = vi.fn();
        Element.prototype.scrollIntoView = scrollIntoViewSpy;
        const songs = [makeSong('1'), makeSong('2')];

        render(
            <MainContent
                songs={songs}
                currentTrackPath={null}
                isAudioPlaying={false}
                isAudioLoading={false}
                onPlaySong={vi.fn()}
                onReorder={vi.fn()}
                username="alex"
            />,
        );

        expect(scrollIntoViewSpy).not.toHaveBeenCalled();
        expect(screen.getByTestId('row-1').getAttribute('data-highlighted')).toBe('false');
    });

    it('scrolls once the target row mounts, even if it is not present on first render', () => {
        vi.useFakeTimers();
        const scrollIntoViewSpy = vi.fn();
        Element.prototype.scrollIntoView = scrollIntoViewSpy;

        const { rerender } = render(
            <MainContent
                songs={[]}
                currentTrackPath={null}
                isAudioPlaying={false}
                isAudioLoading={false}
                onPlaySong={vi.fn()}
                onReorder={vi.fn()}
                username="alex"
                highlightTrackId="1"
            />,
        );

        expect(scrollIntoViewSpy).not.toHaveBeenCalled();

        rerender(
            <MainContent
                songs={[makeSong('1')]}
                currentTrackPath={null}
                isAudioPlaying={false}
                isAudioLoading={false}
                onPlaySong={vi.fn()}
                onReorder={vi.fn()}
                username="alex"
                highlightTrackId="1"
            />,
        );

        expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('row-1').getAttribute('data-highlighted')).toBe('true');
    });
});
