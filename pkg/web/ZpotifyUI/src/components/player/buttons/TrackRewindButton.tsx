import cls from "@/components/player/buttons/TrackRewindButton.module.css";


export interface TrackRewindButton {
    next?: boolean
    previous?: boolean
}

export default function TrackRewindButton({previous}: TrackRewindButton) {
    return (
        <div className={cls.TrackRewindWrapper}>
            <svg
                style={{
                    transform: previous ? 'scaleX(-1)' : 'none',
                }}
                viewBox="0 0 32 32">
                <rect
                    x="18" y="9" width="5" height="14"
                    fill={'black'}
                />
                <polygon
                    points="9,9 9,23 18,16 "
                    fill={'black'}
                />
            </svg>
        </div>
    )
}
