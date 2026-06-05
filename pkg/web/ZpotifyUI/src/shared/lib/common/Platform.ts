export function isIosSafari() {
    const ua = window.navigator.userAgent;
    const isIOS = /iP(ad|hone|od)/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    return isIOS && isSafari;
}
