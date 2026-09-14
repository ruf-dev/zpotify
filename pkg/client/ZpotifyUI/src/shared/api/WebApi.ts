import { BaseService } from '@/shared/api/BaseService.ts';
import {
    ServiceError,
    WithDescription,
    WithHttpStatus,
    WithIsNonRetryable,
    WithStatusCode,
    WithTitle,
} from '@/shared/api/Errors.ts';

export interface WebApi {
    UploadFile(file: File, signal?: AbortSignal, folderName?: string): Promise<string>;
    UploadFileWithProgress(
        file: File,
        onProgress: (pct: number) => void,
        signal?: AbortSignal,
        folderName?: string,
    ): Promise<string>;
    UploadTorrent(file: File): Promise<{ id: string }>;
}

enum WebApiUriPath {
    Upload = '/wapi/files/upload',
    UploadTorrent = '/wapi/torrents/files',
}

export class WebApiImpl extends BaseService implements WebApi {
    UploadFile(file: File, signal?: AbortSignal, folderName?: string): Promise<string> {
        return this.executeAuthApiCall(async (initReq) => {
            const formData = new FormData();
            if (folderName) {
                formData.append('folder', folderName);
            }
            formData.append('file', file, file.name);

            const headers = new Headers(initReq.headers as HeadersInit);
            headers.delete('Content-Type');

            const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.Upload}`;

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                signal,
            });

            if (response.ok) {
                const body = (await response.json()) as { id: number };
                return String(body.id);
            }

            throw await ServiceErrorFromHttp(response);
        });
    }

    UploadFileWithProgress(
        file: File,
        onProgress: (pct: number) => void,
        signal?: AbortSignal,
        folderName?: string,
    ): Promise<string> {
        return this.executeAuthApiCall((initReq) => {
            return new Promise<string>((resolve, reject) => {
                const formData = new FormData();
                if (folderName) {
                    formData.append('folder', folderName);
                }
                formData.append('file', file, file.name);

                const headers = new Headers(initReq.headers as HeadersInit);
                headers.delete('Content-Type');

                const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.Upload}`;

                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                headers.forEach((value, key) => {
                    xhr.setRequestHeader(key, value);
                });

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        onProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const body = JSON.parse(xhr.responseText) as { id: number };
                        resolve(String(body.id));
                    } else {
                        reject(
                            new ServiceError(
                                WithHttpStatus(xhr.status),
                                WithStatusCode(xhr.status),
                                WithTitle('Error calling WebApi'),
                                WithDescription(xhr.responseText),
                            ),
                        );
                    }
                };

                xhr.onerror = () => {
                    reject(new ServiceError(WithTitle('Server is not available. Try again later')));
                };

                xhr.onabort = () => {
                    reject(new ServiceError(WithTitle('Upload cancelled'), WithIsNonRetryable(true)));
                };

                if (signal) {
                    if (signal.aborted) {
                        xhr.abort();
                    } else {
                        signal.addEventListener('abort', () => xhr.abort());
                    }
                }

                xhr.send(formData);
            });
        });
    }

    UploadTorrent(file: File): Promise<{ id: string }> {
        return this.executeAuthApiCall(async (initReq) => {
            const formData = new FormData();
            formData.append('file', file, file.name);

            const headers = new Headers(initReq.headers as HeadersInit);
            headers.delete('Content-Type');

            const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.UploadTorrent}`;

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (response.ok) {
                const body = (await response.json()) as { id: string };
                return { id: String(body.id) };
            }

            throw await ServiceErrorFromHttp(response);
        });
    }
}

async function ServiceErrorFromHttp(r: Response): Promise<ServiceError> {
    return new ServiceError(
        WithHttpStatus(r.status),
        WithStatusCode(r.status),
        WithTitle('Error calling WebApi'),
        WithDescription(await r.text()),
    );
}

export const webApiService = new WebApiImpl();
