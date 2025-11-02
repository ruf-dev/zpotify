import React, {useRef, useState, useEffect, ReactNode} from "react";
import {motion} from "framer-motion";
import cls from "@/components/carousel/Carousel.module.css";
import cn from "classnames";
import {flushSync} from "react-dom";

interface CarouselProps {
    children: ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({children}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [centerIndex, setCenterIndex] = useState(0);

    function onChildClick(index: number) {
        const container = scrollRef.current;
        const item = itemRefs.current[index];
        if (!container || !item) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const itemCenter = item.offsetLeft + itemRect.width / 2;

        const targetScrollLeft = itemCenter - containerRect.width / 2;

        flushSync(() => {
            setCenterIndex(index);
        });

        container.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });
    }

    // observe which item is centered
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                let maxRatio = 0;
                let newIndex = centerIndex;

                for (const entry of entries) {
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        newIndex = itemRefs.current.indexOf(entry.target as HTMLDivElement);
                    }
                }

                if (newIndex !== centerIndex) {
                    setCenterIndex(newIndex);
                }
            },
            {
                root: scrollRef.current,
                threshold: buildThresholdList(20),
            }
        );

        itemRefs.current.forEach((item) => item && observer.observe(item));
        return () => observer.disconnect();
    }, [centerIndex]);

    // helper: fine-grained thresholds for smooth detection
    function buildThresholdList(steps: number) {
        const thresholds = [];
        for (let i = 0; i <= steps; i++) thresholds.push(i / steps);
        return thresholds;
    }

    return (
        <div className={cls.CarouselContainer} ref={scrollRef}>
            <div className={cls.CarouselTrack}>
                {React.Children.map(children, (child, i) => (
                    <motion.div
                        key={i}
                        ref={(el) => (itemRefs.current[i] = el!)}
                        className={cn(cls.CarouselItem, {
                            [cls.centered]: i === centerIndex,
                        })}
                        onClick={() => onChildClick(i)}
                        animate={{
                            opacity: i === centerIndex ? 1 : 0.6,
                        }}
                        transition={{duration: 0.25, ease: "easeOut"}}
                    >
                        {child}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
