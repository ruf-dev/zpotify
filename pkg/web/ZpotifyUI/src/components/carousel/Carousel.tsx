import React, {useRef, useState, useEffect, ReactNode} from "react";
import {motion} from "framer-motion";
import cls from "@/components/carousel/Carousel.module.css";
import cn from "classnames";
import {flushSync} from "react-dom";

interface CarouselProps {
    children: ReactNode[];
    visibleItems?: number; // number of items considered for center frame
    width?: string;
}

const Carousel: React.FC<CarouselProps> = ({children, visibleItems = 3, width = '100vw'}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [centerIndex, setCenterIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState(false);
    const [_, setIsUserScrolling] = useState(false);

    let scrollTimeout: number | undefined;

    // -------------------------
    // Update container width dynamically
    // -------------------------
    useEffect(() => {
        if (!scrollRef.current) return;
        const updateWidth = () => setContainerWidth(scrollRef.current!.offsetWidth);

        // Initial measurement
        updateWidth();

        // Listen to resize
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(scrollRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // -------------------------
    // Click handler: center item smoothly
    // -------------------------
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

        setTimeout(() => setIsScrollingProgrammatically(false), 150);
    }

    // -------------------------
    // Scroll handler
    // -------------------------
    const handleScroll = () => {
        if (isScrollingProgrammatically) {
            if (scrollTimeout) window.clearTimeout(scrollTimeout);
            scrollTimeout = window.setTimeout(() => setIsScrollingProgrammatically(false), 100);
            return;
        }

        setIsUserScrolling(true);
        if (scrollTimeout) window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => setIsUserScrolling(false), 50);
    };

    // -------------------------
    // Dynamic scaling based on overlap with center frame
    // -------------------------
    const calculateScale = (index: number) => {

        const container = scrollRef.current;
        const item = itemRefs.current[index];

        if (index == centerIndex) {
            return 1;
        }

        if (!container || !item || containerWidth === 0) return 0.9;

        const blockWidth = containerWidth / visibleItems;

        let centerStart: number;
        let centerEnd: number;

        if (visibleItems % 2 === 1) {
            // odd: middle block
            centerStart = (containerWidth - blockWidth) / 2;
            centerEnd = centerStart + blockWidth;
        } else {
            // even: middle gap
            centerStart = containerWidth / 2 - blockWidth / 2;
            centerEnd = containerWidth / 2 + blockWidth / 2;
        }

        const itemLeft = item.offsetLeft - container.scrollLeft;
        const itemRight = itemLeft + item.offsetWidth;

        const overlap = Math.max(0, Math.min(itemRight, centerEnd) - Math.max(itemLeft, centerStart));
        const fraction = overlap / item.offsetWidth;

        return 0.9 + 0.1 * Math.min(1, fraction); // scale 0.9 → 1
    };

    return (
        <div
            className={cls.CarouselContainer}
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
                width: width,
            }}
        >
            <div className={cls.CarouselTrack}>
                {React.Children.map(children, (child, i) => (
                    <motion.div
                        key={i}
                        className={cls.CarouselItem}
                        ref={(el: HTMLDivElement | null): void => {
                            itemRefs.current[i] = el!;
                        }}
                        onClick={() => onChildClick(i)}
                    >
                        <motion.div
                            className={cn(cls.CarouselItemContent, {[cls.centered]: i === centerIndex})}
                            animate={{
                                scale: calculateScale(i),
                                opacity: calculateScale(i), // optional: scale opacity proportionally
                            }}
                            transition={{type: "spring", stiffness: 500, damping: 35}}
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
