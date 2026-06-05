import {AuthMiddleware} from "@/shared/api/Auth.ts";
import {BaseService} from "@/shared/api/BaseService.ts";
import {
    ServiceError, WithDescription,
    WithHttpStatus,
    WithStatusCode,
    WithTitle
} from "@/shared/api/Errors.ts";

export interface WebApi {
    UploadFile(file: File): Promise<string>
    UploadFileWithProgress(file: File, onProgress: (pct: number) => void): Promise<string>
}

enum WebApiUriPath {
    Upload = '/wapi/files/upload'
}

export class WebApiImpl extends BaseService implements WebApi {
    constructor(auth: AuthMiddleware) {
        super(auth)
    }

    UploadFile(file: File): Promise<string> {
        return this.executeAuthApiCall(async (initReq) => {
                const formData = new FormData()
                formData.append('file', file, file.name)

                const headers = new Headers(initReq.headers as HeadersInit)
                headers.delete('Content-Type')

                const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.Upload}`

                const response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData,
                })

                if (response.ok) {
                    const body = await response.json() as { id: number }
                    return String(body.id)
                }

                throw await ServiceErrorFromHttp(response)
            }
        )
    }

    UploadFileWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
        return this.executeAuthApiCall((initReq) => {
            return new Promise<string>((resolve, reject) => {
                const formData = new FormData()
                formData.append('file', file, file.name)

                const headers = new Headers(initReq.headers as HeadersInit)
                headers.delete('Content-Type')

                const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.Upload}`

                const xhr = new XMLHttpRequest()
                xhr.open('POST', url)
                headers.forEach((value, key) => { xhr.setRequestHeader(key, value) })

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        onProgress(Math.round((e.loaded / e.total) * 100))
                    }
                }

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const body = JSON.parse(xhr.responseText) as { id: number }
                        resolve(String(body.id))
                    } else {
                        reject(new ServiceError(
                            WithHttpStatus(xhr.status),
                            WithStatusCode(xhr.status),
                            WithTitle('Error calling WebApi'),
                            WithDescription(xhr.responseText),
                        ))
                    }
                }

                xhr.onerror = () => {
                    reject(new ServiceError(WithTitle('Server is not available. Try again later')))
                }

                xhr.send(formData)
            })
        })
    }
}


async function ServiceErrorFromHttp(r: Response): Promise<ServiceError> {
    return new ServiceError(
        WithHttpStatus(r.status),
        WithStatusCode(r.status),
        WithTitle("Error calling WebApi"),
        WithDescription(await r.text())
    )
}
