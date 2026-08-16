import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(orientation: portrait)';

function getInitialMatches(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(getInitialMatches);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const mediaQueryList = window.matchMedia(MOBILE_QUERY);

        function handleChange(e: MediaQueryListEvent) {
            setIsMobile(e.matches);
        }

        mediaQueryList.addEventListener('change', handleChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, []);

    return isMobile;
}
