import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    clipboardPermissionState,
    clipboardSupport,
    hasMagnetPrefix,
    isMagnetLink,
    parseMagnet,
    readClipboardMagnet,
    readClipboardText,
} from '@/features/upload/magnetLink.ts';

const MAGNET = 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=ubuntu';

function stubNavigator(permissionsQuery: () => Promise<{ state: string }>, readText: () => Promise<string>) {
    Object.defineProperty(navigator, 'permissions', { value: { query: permissionsQuery }, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { readText }, configurable: true });
}

describe('isMagnetLink', () => {
    it('returns true for a magnet uri with a btih hash', () => {
        expect(isMagnetLink(MAGNET)).toBe(true);
    });

    it('returns true for surrounding whitespace and upper-case scheme', () => {
        expect(isMagnetLink(`  ${MAGNET.toUpperCase()}\n`)).toBe(true);
    });

    it('returns false for a magnet uri without a btih hash', () => {
        expect(isMagnetLink('magnet:?dn=ubuntu')).toBe(false);
    });

    it('returns false for plain text', () => {
        expect(isMagnetLink('hello world')).toBe(false);
    });
});

describe('hasMagnetPrefix', () => {
    it('returns true for a magnet prefix regardless of case', () => {
        expect(hasMagnetPrefix('MAGNET:?xt=')).toBe(true);
    });

    it('returns false for other text', () => {
        expect(hasMagnetPrefix('https://example.com')).toBe(false);
    });
});

describe('readClipboardMagnet', () => {
    afterEach(() => {
        Reflect.deleteProperty(navigator, 'permissions');
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('returns null without reading the clipboard when the permission query rejects', async () => {
        const readText = vi.fn().mockResolvedValue(MAGNET);
        stubNavigator(() => Promise.reject(new TypeError('unsupported')), readText);

        expect(await readClipboardMagnet()).toBeNull();
        expect(readText).not.toHaveBeenCalled();
    });

    it.each(['denied', 'prompt'])(
        'returns null without reading the clipboard when the permission is %s',
        async (state) => {
            const readText = vi.fn().mockResolvedValue(MAGNET);
            stubNavigator(() => Promise.resolve({ state }), readText);

            expect(await readClipboardMagnet()).toBeNull();
            expect(readText).not.toHaveBeenCalled();
        },
    );

    it('returns the trimmed magnet when the permission is granted', async () => {
        stubNavigator(
            () => Promise.resolve({ state: 'granted' }),
            () => Promise.resolve(` ${MAGNET}\n`),
        );

        expect(await readClipboardMagnet()).toBe(MAGNET);
    });

    it('returns null when the clipboard text is not a magnet link', async () => {
        stubNavigator(
            () => Promise.resolve({ state: 'granted' }),
            () => Promise.resolve('just some text'),
        );

        expect(await readClipboardMagnet()).toBeNull();
    });
});

describe('parseMagnet', () => {
    it('returns the lower-cased info hash and decoded display name', () => {
        const uri = 'magnet:?xt=urn:btih:C12FE1C06BBA254A9DC9F519B335AA7C1367A88A&dn=Ubuntu%2024.04+LTS';

        expect(parseMagnet(uri)).toEqual({
            displayName: 'Ubuntu 24.04 LTS',
            infoHash: 'c12fe1c06bba254a9dc9f519b335aa7c1367a88a',
        });
    });

    it('returns an empty display name when dn is missing', () => {
        expect(parseMagnet('magnet:?xt=urn:btih:abc123')).toEqual({ displayName: '', infoHash: 'abc123' });
    });

    it('returns null for text that is not a magnet link', () => {
        expect(parseMagnet('hello')).toBeNull();
    });
});

describe('clipboardSupport', () => {
    afterEach(() => {
        Reflect.deleteProperty(navigator, 'permissions');
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('returns persistent when the clipboard-read permission query resolves', async () => {
        stubNavigator(
            () => Promise.resolve({ state: 'prompt' }),
            () => Promise.resolve(''),
        );

        expect(await clipboardSupport()).toBe('persistent');
    });

    it('returns oneShot when the query rejects but readText exists', async () => {
        stubNavigator(
            () => Promise.reject(new TypeError('unsupported')),
            () => Promise.resolve(''),
        );

        expect(await clipboardSupport()).toBe('oneShot');
    });

    it('returns none when the query rejects and readText is missing', async () => {
        Object.defineProperty(navigator, 'permissions', {
            value: { query: () => Promise.reject(new TypeError('unsupported')) },
            configurable: true,
        });
        Object.defineProperty(navigator, 'clipboard', { value: {}, configurable: true });

        expect(await clipboardSupport()).toBe('none');
    });
});

describe('clipboardPermissionState', () => {
    afterEach(() => {
        Reflect.deleteProperty(navigator, 'permissions');
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('returns the permission state', async () => {
        stubNavigator(
            () => Promise.resolve({ state: 'prompt' }),
            () => Promise.resolve(''),
        );

        expect(await clipboardPermissionState()).toBe('prompt');
    });

    it('returns null when the query rejects', async () => {
        stubNavigator(
            () => Promise.reject(new TypeError('unsupported')),
            () => Promise.resolve(''),
        );

        expect(await clipboardPermissionState()).toBeNull();
    });
});

describe('readClipboardText', () => {
    afterEach(() => {
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('returns the clipboard text', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { readText: () => Promise.resolve('hi') },
            configurable: true,
        });

        expect(await readClipboardText()).toBe('hi');
    });

    it('returns null when readText rejects', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { readText: () => Promise.reject(new DOMException('denied')) },
            configurable: true,
        });

        expect(await readClipboardText()).toBeNull();
    });
});
