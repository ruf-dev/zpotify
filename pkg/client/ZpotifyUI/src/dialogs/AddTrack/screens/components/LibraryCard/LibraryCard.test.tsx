import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import LibraryCard from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard';

function renderCard(overrides: Partial<Parameters<typeof LibraryCard>[0]>) {
    const onClick = vi.fn();
    const view = render(
        <LibraryCard onClick={onClick} disabled={false} pendingCount={3} isLoading={false} {...overrides} />,
    );
    return { ...view, onClick };
}

describe('LibraryCard', () => {
    afterEach(cleanup);

    it('shows the pending count title and subtitle when loaded', () => {
        renderCard({});

        expect(screen.getByText(/Pending 3 uploads/)).not.toBeNull();
        expect(screen.getByText('assign an already-uploaded file')).not.toBeNull();
    });

    it('calls onClick when a loaded card is clicked', () => {
        const { onClick } = renderCard({});

        fireEvent.click(screen.getByText(/Pending 3 uploads/));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('hides the texts and marks the card busy while loading', () => {
        const { container } = renderCard({ isLoading: true });

        expect(screen.queryByText(/Pending/)).toBeNull();
        expect(screen.queryByText('assign an already-uploaded file')).toBeNull();
        expect(container.firstElementChild?.getAttribute('aria-busy')).toBe('true');
    });

    it('does not call onClick while loading', () => {
        const { onClick, container } = renderCard({ isLoading: true });

        fireEvent.click(container.firstElementChild as Element);

        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when disabled', () => {
        const { onClick } = renderCard({ disabled: true });

        fireEvent.click(screen.getByText(/Pending 3 uploads/));

        expect(onClick).not.toHaveBeenCalled();
    });
});
