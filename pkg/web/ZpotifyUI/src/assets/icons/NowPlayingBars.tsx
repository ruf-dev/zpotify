import cls from '@/assets/icons/NowPlayingBars.module.scss'
import cn from 'classnames'

export default function NowPlayingBars() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" className={cls.Container}>
            <rect className={cn(cls.Bar, cls.Bar1)} x="0" y="5" width="3" height="4" rx="1" fill="var(--color-fg-accent)"/>
            <rect className={cn(cls.Bar, cls.Bar2)} x="5" y="3" width="3" height="8" rx="1" fill="var(--color-fg-accent)"/>
            <rect className={cn(cls.Bar, cls.Bar3)} x="10" y="4" width="3" height="6" rx="1" fill="var(--color-fg-accent)"/>
        </svg>
    )
}
