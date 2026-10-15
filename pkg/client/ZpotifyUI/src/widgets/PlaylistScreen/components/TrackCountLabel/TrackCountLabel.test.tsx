import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import TrackCountLabel from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.tsx';

describe('TrackCountLabel', () => {
    afterEach(cleanup);

    it('shows the track count and duration for a regular playlist', () => {
        render(<TrackCountLabel displayValue="12 tracks" totalDuration="48 min" />);

        expect(screen.getByText('12 tracks')).toBeTruthy();
        expect(screen.getByText('48 min')).toBeTruthy();
    });

    it('shows only the duration for a single', () => {
        render(<TrackCountLabel displayValue="1 tracks" totalDuration="4 min" isSingle />);

        expect(screen.queryByText('1 tracks')).toBeNull();
        expect(screen.getByText('4 min')).toBeTruthy();
    });
});
