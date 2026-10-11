const STATUS_STAGES: ReadonlyArray<{ fromSeconds: number; text: string }> = [
    { fromSeconds: 90, text: 'Almost out of time — this torrent may have no active peers.' },
    { fromSeconds: 30, text: 'Still searching — less popular torrents take longer…' },
    { fromSeconds: 10, text: 'Asking the swarm for metadata…' },
    { fromSeconds: 0, text: 'Looking for peers…' },
];

export function resolvingStatusText(elapsedSeconds: number): string {
    const stage = STATUS_STAGES.find((s) => elapsedSeconds >= s.fromSeconds);
    return stage ? stage.text : STATUS_STAGES[STATUS_STAGES.length - 1].text;
}
