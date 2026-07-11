import { useEffect, useRef, useState } from 'react';

type Drag = {
    id: string;
    fromIdx: number;
    startY: number;
    dy: number;
    height: number;
    settling: boolean;
    // Viewport rect of the dragged row, captured once at drag start — used to
    // position the portaled ghost row (see computeGhostStyle below).
    rect: DOMRect;
} | null;

export interface TrackDragApi {
    draggedIdx: number | null;
    isActive: boolean;
    rowRefs: React.MutableRefObject<Record<string, HTMLElement>>;
    startDrag: (id: string, idx: number, e: React.PointerEvent) => void;
    getRowStyle: (idx: number) => React.CSSProperties;
    getGhostStyle: () => React.CSSProperties;
}

// Style for a row that stays in the flow list: the dragged row's own slot is
// hidden (its live visual is the portaled ghost, see computeGhostStyle), and
// rows between fromIdx and the current drop target shift aside to open a gap.
function computeRowStyle(idx: number, drag: Drag, dropIdx: number | null): React.CSSProperties {
    if (!drag) return {};
    const { fromIdx, height } = drag;
    const drop = dropIdx ?? fromIdx;

    if (idx === fromIdx) {
        return { visibility: 'hidden' };
    }
    if (fromIdx < drop && idx > fromIdx && idx <= drop) {
        return {
            transform: `translateY(-${height}px)`,
            transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: 'transform',
        };
    }
    if (fromIdx > drop && idx >= drop && idx < fromIdx) {
        return {
            transform: `translateY(${height}px)`,
            transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: 'transform',
        };
    }
    return {};
}

// Style for the floating "ghost" clone of the dragged row, portaled to
// document.body so it always paints above every sibling row without needing
// z-index — DOM order (last child of body) settles the stacking instead.
function computeGhostStyle(drag: Drag): React.CSSProperties {
    if (!drag) return {};
    const { dy, settling, rect } = drag;
    return {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        transform: `translateY(${dy}px) rotate(2.2deg) scale(1.025)`,
        boxShadow:
            '0 18px 40px rgba(0,0,0,0.7), 0 0 0 1px var(--color-accent-border), 0 0 32px var(--color-accent-shadow)',
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-accent-border)',
        cursor: 'grabbing',
        willChange: 'transform',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: settling
            ? 'transform 0.23s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.23s ease, border-color 0.23s ease'
            : 'box-shadow 0.15s ease, border-color 0.15s ease',
    };
}

// Drives the pointer-based reorder-by-drag interaction for TrackList: tracks
// pointer movement while a row's drag handle is held, and reports the
// resulting drop index via onReorder once the pointer is released.
export function useTrackDrag(trackCount: number, onReorder: (fromIdx: number, toIdx: number) => void): TrackDragApi {
    const [drag, setDrag] = useState<Drag>(null);
    const [dropIdx, setDropIdx] = useState<number | null>(null);
    const dropIdxRef = useRef<number | null>(null);
    const rowRefs = useRef<Record<string, HTMLElement>>({});

    useEffect(() => {
        dropIdxRef.current = dropIdx;
    }, [dropIdx]);

    function startDrag(id: string, idx: number, e: React.PointerEvent) {
        if (drag !== null) return;
        e.preventDefault();
        const el = rowRefs.current[id];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const height = rect.height + 6;
        setDrag({ id, fromIdx: idx, startY: e.clientY, dy: 0, height, settling: false, rect });
        setDropIdx(idx);
    }

    useEffect(() => {
        if (!drag || drag.settling) return;
        const { fromIdx, startY, height } = drag;

        function handleMove(e: PointerEvent) {
            const dy = e.clientY - startY;
            const delta = Math.round(dy / height);
            const next = Math.max(0, Math.min(trackCount - 1, fromIdx + delta));
            setDrag((d) => (d ? { ...d, dy } : d));
            setDropIdx(next);
        }

        window.addEventListener('pointermove', handleMove);
        return () => window.removeEventListener('pointermove', handleMove);
    }, [drag?.id, drag?.settling, trackCount]);

    useEffect(() => {
        if (!drag || drag.settling) return;
        const { fromIdx, height } = drag;

        function handleUp() {
            const finalDrop = dropIdxRef.current ?? fromIdx;
            const targetDy = (finalDrop - fromIdx) * height;
            setDrag((d) => (d ? { ...d, dy: targetDy, settling: true } : d));
            setTimeout(() => {
                setDrag(null);
                setDropIdx(null);
                onReorder(fromIdx, finalDrop);
            }, 230);
        }

        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        return () => {
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [drag?.id, drag?.settling]);

    return {
        draggedIdx: drag?.fromIdx ?? null,
        isActive: drag !== null,
        rowRefs,
        startDrag,
        getRowStyle: (idx: number) => computeRowStyle(idx, drag, dropIdx),
        getGhostStyle: () => computeGhostStyle(drag),
    };
}
