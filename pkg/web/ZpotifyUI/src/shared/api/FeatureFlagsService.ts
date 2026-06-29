import { apiPrefix } from '@/shared/api/Api.ts';
import {FeatureFlag, FeatureFlagsAPI} from "@/app/api/zpotify";

export function fetchFeatureFlags(): Promise<FeatureFlag[]> {
    return FeatureFlagsAPI.GetFeatureFlags({}, apiPrefix()).then((resp) => resp.flags ?? []);
}
