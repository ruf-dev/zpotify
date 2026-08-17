import {
    SearchAPI,
    type RecordSearchQueryRequest,
    type RecordSearchFindingRequest,
    type ListSearchHistoryResponse as WireListSearchHistoryResponse,
    type SearchHistoryEntry as WireSearchHistoryEntry,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface SearchHistoryEntry {
    query: string;
    findingType: string;
    findingId: string;
    findingName: string;
    findingCoverUrl: string;
}

export interface ISearchHistoryService {
    recordQuery(query: string): Promise<void>;
    recordFinding(
        query: string,
        findingType: string,
        findingId: string,
        findingName: string,
        findingCoverUrl: string,
    ): Promise<void>;
    list(): Promise<SearchHistoryEntry[]>;
}

export class SearchHistoryService extends BaseService implements ISearchHistoryService {
    recordQuery(query: string): Promise<void> {
        const req: RecordSearchQueryRequest = { query };
        return this.executeAuthApiCall((initReq) => SearchAPI.RecordSearchQuery(req, initReq)).then(() => undefined);
    }

    recordFinding(
        query: string,
        findingType: string,
        findingId: string,
        findingName: string,
        findingCoverUrl: string,
    ): Promise<void> {
        const req: RecordSearchFindingRequest = { query, findingType, findingId, findingName, findingCoverUrl };
        return this.executeAuthApiCall((initReq) => SearchAPI.RecordSearchFinding(req, initReq)).then(() => undefined);
    }

    list(): Promise<SearchHistoryEntry[]> {
        return this.executeAuthApiCall((initReq) => SearchAPI.ListSearchHistory({}, initReq)).then(toEntries);
    }
}

function toEntries(resp: WireListSearchHistoryResponse): SearchHistoryEntry[] {
    return (resp.entries ?? []).map(toEntry);
}

function toEntry(e: WireSearchHistoryEntry): SearchHistoryEntry {
    return {
        query: e.query ?? '',
        findingType: e.findingType ?? '',
        findingId: e.findingId ?? '',
        findingName: e.findingName ?? '',
        findingCoverUrl: e.findingCoverUrl ?? '',
    };
}

export const searchHistoryService = new SearchHistoryService();
