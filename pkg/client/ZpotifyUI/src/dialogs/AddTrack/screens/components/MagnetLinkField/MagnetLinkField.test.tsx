import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import MagnetLinkField from '@/dialogs/AddTrack/screens/components/MagnetLinkField/MagnetLinkField';

const MAGNET = 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a';

function renderField(overrides: { initialValue?: string; disabled?: boolean } = {}) {
    const onSubmit = vi.fn();
    const props = { initialValue: '', disabled: false, onSubmit, ...overrides };
    const view = render(<MagnetLinkField {...props} />);
    return { onSubmit, props, rerender: view.rerender };
}

function addButton() {
    return screen.getByRole('button', { name: 'Add' }) as HTMLButtonElement;
}

describe('MagnetLinkField', () => {
    afterEach(() => cleanup());

    it('disables Add when the text is not a magnet link', () => {
        renderField();

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'https://example.com' } });

        expect(addButton().disabled).toBe(true);
    });

    it('calls onSubmit with the trimmed value when Add is clicked', () => {
        const { onSubmit } = renderField();

        fireEvent.change(screen.getByRole('textbox'), { target: { value: `  ${MAGNET}  ` } });
        fireEvent.click(addButton());

        expect(onSubmit).toHaveBeenCalledWith(MAGNET);
    });

    it('disables Add while disabled even for a magnet link', () => {
        renderField({ initialValue: MAGNET, disabled: true });

        expect(addButton().disabled).toBe(true);
    });

    it('fills the field when the initial value arrives after mount', () => {
        const { props, rerender } = renderField();

        rerender(<MagnetLinkField {...props} initialValue={MAGNET} />);

        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(MAGNET);
    });

    it('keeps what the user typed when the initial value arrives later', () => {
        const { props, rerender } = renderField();

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'magnet:?xt=urn:btih:typed' } });
        rerender(<MagnetLinkField {...props} initialValue={MAGNET} />);

        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('magnet:?xt=urn:btih:typed');
    });
});
