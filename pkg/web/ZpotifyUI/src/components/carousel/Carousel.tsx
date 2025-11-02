import React, { useRef, useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import cls from "@/components/carousel/Carousel.module.css";
import cn from "classnames";
import { flushSync } from "react-dom";

interface CarouselProps {
    children: ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [centerIndex, setCenterIndex] = useState(0);

    const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState(false);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    let scrollTimeout: number | undefined;

    // Click handler: center item smoothly
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
            setIsScrollingProgrammatically(true);
        });

        container.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });
    }

    // Scroll handler: detect end of programmatic scroll
    const handleScroll = () => {
        if (isScrollingProgrammatically) {
            if (scrollTimeout) window.clearTimeout(scrollTimeout);
            scrollTimeout = window.setTimeout(() => {
                setIsScrollingProgrammatically(false);
            }, 100);
            return
        }

        setIsUserScrolling(true)
        if (scrollTimeout) window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
            setIsUserScrolling(false);
        }, 5);
    };

    // IntersectionObserver: detect centered item on manual scroll
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingProgrammatically || isUserScrolling) return; // ignore auto scroll

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
                root: container,
                threshold: buildThresholdList(20),
            }
        );

        itemRefs.current.forEach((item) => item && observer.observe(item));
        return () => observer.disconnect();
    }, [centerIndex, isScrollingProgrammatically, isUserScrolling]);

    // Helper: fine-grained thresholds
    function buildThresholdList(steps: number) {
        const thresholds: number[] = [];
        for (let i = 0; i <= steps; i++) thresholds.push(i / steps);
        return thresholds;
    }

    return (
        <div className={cls.CarouselContainer} ref={scrollRef} onScroll={handleScroll}>
            <div className={cls.CarouselTrack}>
                {React.Children.map(children, (child, i) => (
                    <motion.div
                        key={i}
                        className={cls.CarouselItem}
                        ref={(el) => (itemRefs.current[i] = el!)}
                        onClick={() => onChildClick(i)}
                    >
                        <motion.div
                            className={cn(cls.CarouselItemContent, {
                                [cls.centered]: i === centerIndex,
                            })}
                            animate={{
                                scale: i === centerIndex ? 1 : 0.9,
                                opacity: i === centerIndex ? 1 : 0.6,
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 35  }}
                        >
                            {child}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
