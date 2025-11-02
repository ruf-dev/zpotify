import React, {
    useRef,
    useState,
    useEffect,
    useLayoutEffect,
    ReactNode,
    UIEvent,
} from "react";
import {motion, useAnimation} from "framer-motion";
import cls from "@/components/carousel/Carousel.module.css";

interface CarouselProps {
    children: ReactNode[];
    onSelect?: (index: number) => void;
}

const Carousel: React.FC<CarouselProps> = ({children, onSelect}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const controls = useAnimation();

    const [centerIndex, setCenterIndex] = useState(0);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const [scrollTimeout, setScrollTimeout] = useState<number | null>(null);

    // --- measure and center selected item
    const centerItem = (index: number, smooth = true) => {
        const container = scrollRef.current;
        const item = itemRefs.current[index];
        if (!container || !item) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const containerCenter = containerRect.width / 2;
        const itemCenter = item.offsetLeft + itemRect.width / 2;

        const targetScroll = itemCenter - containerCenter;
        container.scrollTo({
            left: targetScroll,
            behavior: smooth ? "smooth" : "auto",
        });
    };

    const handleClick = (index: number) => {
        setCenterIndex(index);
        centerItem(index);
    };

    // --- update selection when user scrolls and stops
    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        setIsUserScrolling(true);
        if (scrollTimeout) window.clearTimeout(scrollTimeout);
        const timeout = window.setTimeout(() => {
            setIsUserScrolling(false);
            snapToClosest();
        }, 120);
        setScrollTimeout(timeout);
    };

    const snapToClosest = () => {
        const container = scrollRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const containerCenter = container.scrollLeft + containerRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        itemRefs.current.forEach((item, i) => {
            if (!item) return;
            const itemCenter = item.offsetLeft + item.offsetWidth / 2;
            const distance = Math.abs(containerCenter - itemCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });

        setCenterIndex(closestIndex);
        centerItem(closestIndex);
        onSelect?.(closestIndex);
    };

    // --- initial centering on mount
    useLayoutEffect(() => {
        centerItem(centerIndex, false);
    }, []);

    // --- re-center when index changes via click
    useEffect(() => {
        if (!isUserScrolling) centerItem(centerIndex);
    }, [centerIndex]);

    return (
        <div className={cls.CarouselContainer} ref={scrollRef} onScroll={handleScroll}>
            <motion.div className={cls.CarouselTrack} animate={controls}>
                {React.Children.map(children, (child, i) => (
                    <motion.div
                        key={i}
                        ref={(el) => (itemRefs.current[i] = el!)}
                        className={cls.CarouselItem}
                        onClick={() => handleClick(i)}
                        animate={{scale: i === centerIndex ? 1 : 0.9}}
                        transition={{type: "spring", stiffness: 250, damping: 25}}
                    >
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Carousel;
