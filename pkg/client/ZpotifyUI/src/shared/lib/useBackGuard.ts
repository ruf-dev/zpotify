import { useEffect, useRef } from 'react';

type BackHandler = () => void;

const stack: BackHandler[] = [];
let pendingSyntheticPops = 0;
let listenerAttached = false;

function handlePopState() {
    if (pendingSyntheticPops > 0) {
        pendingSyntheticPops -= 1;
        return;
    }
    const handler = stack.pop();
    handler?.();
}

function ensureListener() {
    if (listenerAttached) return;
    listenerAttached = true;
    window.addEventListener('popstate', handlePopState);
}

export function useBackGuard(active: boolean, onBack: () => void) {
    const onBackRef = useRef(onBack);
    onBackRef.current = onBack;

    useEffect(() => {
        if (!active) return undefined;

        ensureListener();
        let consumedByPop = false;

        function handler() {
            consumedByPop = true;
            onBackRef.current();
        }

        stack.push(handler);
        window.history.pushState({ backGuard: true }, '');

        return () => {
            const idx = stack.lastIndexOf(handler);
            if (idx !== -1) stack.splice(idx, 1);

            // If this guard is closing for a reason other than the popstate it registered for
            // (e.g. the on-screen back button was clicked directly), the history entry it pushed
            // is still there — burn it via history.back() and mark the resulting popstate as
            // synthetic so it doesn't get misdelivered to whichever guard is now on top.
            if (!consumedByPop) {
                pendingSyntheticPops += 1;
                window.history.back();
            }
        };
    }, [active]);
}
