export const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const parts = [];
    if (hours > 0) {
        parts.push(hours.toString());
        parts.push(minutes.toString().padStart(2, "0"));
    } else {
        parts.push(minutes.toString());
    }
    parts.push(seconds.toString().padStart(2, "0"));

    return parts.join(":");
};
