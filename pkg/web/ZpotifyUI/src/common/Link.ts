import {isIosSafari} from "@/common/Platform.ts";

export function TgDeeplink(url: string): string {
    if (isIosSafari()) {
        return `https://t.me`
    }
    return `tg://${url}`
}
