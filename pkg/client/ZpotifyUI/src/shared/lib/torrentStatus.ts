// Terminal torrent job statuses — once a job reaches one of these, polling can stop
// and cancellation is no longer possible. Keep in sync with the backend torrent worker.
const TERMINAL_TORRENT_STATUSES = new Set(['done', 'failed', 'canceled', 'seeding']);

export function isTerminalTorrentStatus(status: string | undefined): boolean {
    return TERMINAL_TORRENT_STATUSES.has(status ?? '');
}
