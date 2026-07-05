import { useRef } from 'react';

interface GenerativeCoverProps {
    seed: number;
    className?: string;
}

export default function GenerativeCover({ seed, className }: GenerativeCoverProps) {
    const gid = useRef('gv' + Math.random().toString(36).slice(2, 7)).current;

    const palettes = [
        { bg: '#100016', a: '#d9007f', b: '#8a0050', c: '#ff80c8' },
        { bg: '#000d1a', a: '#0077e6', b: '#003d80', c: '#66b3ff' },
        { bg: '#001a0a', a: '#00b36b', b: '#005c35', c: '#66ffa8' },
        { bg: '#1a1200', a: '#e6a800', b: '#7a5500', c: '#ffd966' },
        { bg: '#1a0500', a: '#e64400', b: '#7a2200', c: '#ff9966' },
        { bg: '#080018', a: '#7400e6', b: '#3c0073', c: '#c466ff' },
        { bg: '#0a0a0a', a: '#4a4a4a', b: '#2a2a2a', c: '#909090' },
    ];

    const s = Math.max(1, Math.round(Math.abs(seed)));
    const p = palettes[(s - 1) % 7];

    function r(n: number): number {
        const v = Math.sin(s * 127.1 + n * 311.7) * 43758.5453;
        return v - Math.floor(v);
    }

    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            <defs>
                <radialGradient id={gid} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={p.a} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={p.bg} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="100" height="100" fill={p.bg} />
            {([0, 1, 2, 3] as const).map((i) => (
                <circle
                    key={i}
                    cx={5 + r(i * 6) * 88}
                    cy={5 + r(i * 6 + 1) * 88}
                    r={8 + r(i * 6 + 2) * 28}
                    fill={[p.a, p.b, p.c, p.b][i]}
                    opacity={0.08 + r(i * 6 + 3) * 0.22}
                />
            ))}
            <rect width="100" height="100" fill={`url(#${gid})`} />
            <rect
                x={20 + r(40) * 30}
                y={20 + r(41) * 30}
                width={12 + r(42) * 18}
                height={12 + r(43) * 18}
                rx="2"
                fill={p.a}
                opacity="0.14"
                transform={`rotate(${-30 + r(44) * 60} 50 50)`}
            />
            <circle cx={20 + r(50) * 60} cy={20 + r(51) * 60} r={3 + r(52) * 3} fill={p.c} opacity="0.85" />
        </svg>
    );
}
