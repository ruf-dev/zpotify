import type { CSSProperties } from 'react';

import cls from '@/components/GenerativeCover/GenerativeCover.module.css';

const PALETTES: readonly (readonly string[])[] = [
    ['#1a0a2e', '#4a1280', '#8b21c8', '#c44dff'],
    ['#0a1628', '#1a3a6e', '#2d6abf', '#5b9ef5'],
    ['#1a0a0a', '#6e1a1a', '#c44444', '#ff7070'],
    ['#0a1a0f', '#1a5c2e', '#2db36a', '#5bf5a0'],
    ['#1a1500', '#5c4a00', '#c4a200', '#ffd454'],
    ['#0f0a1a', '#2e1a5c', '#6a3db3', '#b07bf5'],
    ['#001a1a', '#005c5c', '#00a2a2', '#4dfafa'],
];

type ShapeFn = (p: readonly string[], s: number) => string;

const SHAPES: ShapeFn[] = [
    (p, s) =>
        `<circle cx="${s * 0.3}" cy="${s * 0.3}" r="${s * 0.35}" fill="${p[2]}" opacity="0.7"/>` +
        `<circle cx="${s * 0.7}" cy="${s * 0.7}" r="${s * 0.3}" fill="${p[3]}" opacity="0.8"/>` +
        `<circle cx="${s * 0.6}" cy="${s * 0.25}" r="${s * 0.2}" fill="${p[1]}" opacity="0.5"/>`,
    (p, s) =>
        `<rect x="0" y="${s * 0.55}" width="${s}" height="${s * 0.5}" fill="${p[1]}"/>` +
        `<rect x="${s * 0.3}" y="${s * 0.25}" width="${s * 0.5}" height="${s * 0.5}" rx="${s * 0.08}" fill="${p[2]}" opacity="0.8"/>` +
        `<circle cx="${s * 0.7}" cy="${s * 0.35}" r="${s * 0.18}" fill="${p[3]}"/>`,
    (p, s) =>
        `<path d="M0 ${s} Q${s * 0.5} 0 ${s} ${s}" fill="${p[1]}" opacity="0.7"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.22}" fill="${p[3]}"/>` +
        `<circle cx="${s * 0.2}" cy="${s * 0.2}" r="${s * 0.12}" fill="${p[2]}" opacity="0.9"/>`,
    (p, s) =>
        `<rect x="${s * 0.05}" y="${s * 0.05}" width="${s * 0.42}" height="${s * 0.42}" rx="${s * 0.06}" fill="${p[1]}"/>` +
        `<rect x="${s * 0.53}" y="${s * 0.05}" width="${s * 0.42}" height="${s * 0.42}" rx="${s * 0.06}" fill="${p[2]}"/>` +
        `<rect x="${s * 0.05}" y="${s * 0.53}" width="${s * 0.42}" height="${s * 0.42}" rx="${s * 0.06}" fill="${p[3]}" opacity="0.9"/>` +
        `<rect x="${s * 0.53}" y="${s * 0.53}" width="${s * 0.42}" height="${s * 0.42}" rx="${s * 0.06}" fill="${p[2]}" opacity="0.6"/>`,
    (p, s) =>
        `<path d="M0 ${s * 0.6} Q${s * 0.25} ${s * 0.3} ${s * 0.5} ${s * 0.6} T${s} ${s * 0.6} V${s} H0Z" fill="${p[1]}" opacity="0.8"/>` +
        `<path d="M0 ${s * 0.4} Q${s * 0.25} ${s * 0.1} ${s * 0.5} ${s * 0.4} T${s} ${s * 0.4} V${s} H0Z" fill="${p[2]}" opacity="0.6"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.3}" r="${s * 0.15}" fill="${p[3]}"/>`,
    (p, s) =>
        `<polygon points="0,${s} ${s * 0.5},0 ${s},${s}" fill="${p[1]}" opacity="0.7"/>` +
        `<polygon points="${s * 0.25},${s} ${s * 0.75},${s * 0.2} ${s},${s}" fill="${p[2]}" opacity="0.7"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.55}" r="${s * 0.15}" fill="${p[3]}"/>`,
    (p, s) =>
        `<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.46}" fill="${p[1]}"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.32}" fill="${p[2]}"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.18}" fill="${p[3]}"/>` +
        `<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.07}" fill="${p[0]}"/>`,
];

interface GenerativeCoverProps {
    seed: number;
    size?: number;
    borderRadius?: string;
}

export default function GenerativeCover({
    seed,
    size = 64,
    borderRadius = 'var(--border-radius-md)',
}: GenerativeCoverProps) {
    const idx = (((seed - 1) % 7) + 7) % 7;
    const p = PALETTES[idx];
    const svgContent =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
        `<rect width="${size}" height="${size}" fill="${p[0]}"/>` +
        SHAPES[idx](p, size) +
        `</svg>`;

    return (
        <div
            className={cls.GenerativeCoverContainer}
            style={{ '--gc-size': `${size}px`, '--gc-radius': borderRadius } as CSSProperties}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
