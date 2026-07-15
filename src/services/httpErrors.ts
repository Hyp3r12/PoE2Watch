export class RateLimitError extends Error {
    retryAfterSeconds: number;

    constructor(retryAfterSeconds: number, message = "Rate limited") {
        super(message);
        this.name = "RateLimitError";
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

export class AuthFailedError extends Error {
    status: number;

    constructor(status: number, message = "Authentication failed") {
        super(message);
        this.name = "AuthFailedError";
        this.status = status;
    }
}

export function parseRetryAfterSeconds(value: string | null, fallbackSeconds: number) {
    if (!value) return fallbackSeconds;

    const seconds = Number(value);

    if (Number.isFinite(seconds) && seconds >= 0) {
        return Math.ceil(seconds);
    }

    const dateMs = Date.parse(value);

    if (Number.isFinite(dateMs)) {
        return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
    }

    return fallbackSeconds;
}
