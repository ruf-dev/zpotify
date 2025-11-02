import React, { useRef, useState, ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import cls from "@/components/carousel/Carousel.module.css";

interface CarouselProps {
    children: ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const controls = useAnimation();
    const [centerIndex, setCenterIndex] = useState(0);

    function onChildClick(index: number) {
        setCenterIndex(index);
        itemRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }

    return (
        <div className={cls.CarouselContainer} ref={scrollRef}>
            <motion.div className={cls.CarouselTrack} animate={controls}>
                {React.Children.map(children, (child, i) => (
                    <motion.div
                        key={i}
                        ref={(el) => (itemRefs.current[i] = el!)}
                        className={cls.CarouselItem}
                        onClick={() => onChildClick(i)}
                        animate={{ scale: i === centerIndex ? 1 : 0.9 }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    >
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Carousel;
