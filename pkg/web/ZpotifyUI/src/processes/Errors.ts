export enum Errors {
    OK = 0,
    CANCELLED = 1,
    UNKNOWN = 2,
    INVALID_ARGUMENT = 3,
    DEADLINE_EXCEEDED = 4,
    NOT_FOUND = 5,
    ALREADY_EXISTS = 6,
    PERMISSION_DENIED = 7,
    RESOURCE_EXHAUSTED = 8,
    FAILED_PRECONDITION = 9,
    ABORTED = 10,
    OUT_OF_RANGE = 11,
    UNIMPLEMENTED = 12,
    INTERNAL = 13,
    UNAVAILABLE = 14,
    DATA_LOSS = 15,
    UNAUTHENTICATED = 16
}

export enum ErrorReason {
    REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
    ACCESS_TOKEN_NOT_FOUND = 'ACCESS_TOKEN_NOT_FOUND',
    ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED'
}

export function isReason(det: GrpcErrorDetails[], ...res: ErrorReason[]) : boolean{
    return det.find(d=> res.includes(d.reason)) !== undefined
}

export type GrpcError = {
    message: string
    code: Errors

    details: GrpcErrorDetails[]
}


export type GrpcErrorDetails = {
    reason: ErrorReason
    domain: string
    metadata: Record<string, string>
}

export class ServiceError {
    isNonRetryable: boolean = false;
    title: string = '';
    details: string = '';

    reason?: ErrorReason;

    constructor(...ops: ((e: ServiceError) => void)[]) {
        ops.map(o => o(this))
    }

}

export function WithIsNonRetryable(isNonRetryable: boolean): (e: ServiceError) => void {
    return (e: ServiceError) => {
        return e.isNonRetryable = isNonRetryable
    }
}

export function WithTitle(title: string): (e: ServiceError) => void {
    return (e: ServiceError) => {
        return e.title = title
    }
}

export function WithReason(reason?: ErrorReason): (e: ServiceError) => void {
    return (e: ServiceError) => {
        return e.reason = reason
    }
}
