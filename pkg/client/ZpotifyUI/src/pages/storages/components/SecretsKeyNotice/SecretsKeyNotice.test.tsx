import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import SecretsKeyNotice from '@/pages/storages/components/SecretsKeyNotice/SecretsKeyNotice.tsx';

describe('SecretsKeyNotice', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows the title and the key generation command', () => {
        render(<SecretsKeyNotice />);

        expect(screen.getByText('Remote storages are locked')).not.toBeNull();
        expect(screen.getByText('openssl rand -base64 32')).not.toBeNull();
    });
});
