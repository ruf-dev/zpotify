import { useEffect, useState } from 'react';

import { fetchFeatureFlags } from '@/shared/api/FeatureFlagsService.ts';
import { useFeatureFlags } from '@/entities/feature-flags/useFeatureFlags.ts';

export function useFeatureFlagsQuery() {
    const loaded = useFeatureFlags((s) => s.loaded);
    const setFlags = useFeatureFlags((s) => s.setFlags);
    const [isLoading, setIsLoading] = useState(!loaded);

    useEffect(() => {
        if (loaded) return;

        setIsLoading(true);
        fetchFeatureFlags()
            .then(setFlags)
            .finally(() => setIsLoading(false));
    }, [loaded, setFlags]);

    return { isLoading };
}
