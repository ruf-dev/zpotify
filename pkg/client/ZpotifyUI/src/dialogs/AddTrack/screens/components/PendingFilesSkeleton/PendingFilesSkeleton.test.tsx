import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import PendingFilesSkeleton from '@/dialogs/AddTrack/screens/components/PendingFilesSkeleton/PendingFilesSkeleton';

describe('PendingFilesSkeleton', () => {
    afterEach(cleanup);

    it('renders a busy placeholder labelled as loading pending uploads', () => {
        render(<PendingFilesSkeleton />);

        const skeleton = screen.getByLabelText('Loading pending uploads');
        expect(skeleton.getAttribute('aria-busy')).toBe('true');
    });
});
