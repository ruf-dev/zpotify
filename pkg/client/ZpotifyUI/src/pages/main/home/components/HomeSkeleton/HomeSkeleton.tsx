import cn from 'classnames';

import cls from '@/pages/main/home/components/HomeSkeleton/HomeSkeleton.module.css';

const TAB_COUNT = 3;
const LINE_COUNT = 4;

export default function HomeSkeleton() {
    return (
        <>
            <div className={cls.TabBarContainer}>
                {Array.from({ length: TAB_COUNT }).map((_, idx) => (
                    <div key={idx} className={cn(cls.ShimmerBlock, cls.TabPill)} />
                ))}
            </div>
            <div className={cls.CarouselContainer}>
                <div className={cls.Card}>
                    <div className={cn(cls.ShimmerBlock, cls.CardTitle)} />
                    {Array.from({ length: LINE_COUNT }).map((_, idx) => (
                        <div key={idx} className={cn(cls.ShimmerBlock, cls.CardLine)} />
                    ))}
                </div>
            </div>
        </>
    );
}
