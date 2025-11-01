import { useState, useEffect, Children } from 'react';
import './Carousel.css';

const Carousel = ({ children, visibleCount = 3, autoPlay = false, interval = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const items = Children.toArray(children);
    const totalItems = items.length;

    // Calculate how many items to actually show (can't exceed total items)
    const actualVisibleCount = Math.min(visibleCount, totalItems);

    // Calculate the range of visible items
    const getVisibleItems = () => {
        const visibleItems = [];

        for (let i = 0; i < actualVisibleCount; i++) {
            let index = currentIndex + i;

            // Handle wrap-around for circular carousel
            if (index >= totalItems) {
                index = index % totalItems;
            }

            visibleItems.push({
                item: items[index],
                index: index,
                position: i
            });
        }

        return visibleItems;
    };

    const nextSlide = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);

        setTimeout(() => setIsTransitioning(false), 300);
    };

    const prevSlide = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);

        setTimeout(() => setIsTransitioning(false), 300);
    };

    const goToSlide = (index) => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex(index);

        setTimeout(() => setIsTransitioning(false), 300);
    };

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || totalItems <= actualVisibleCount) return;

        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [currentIndex, autoPlay, interval, totalItems, actualVisibleCount]);

    // Reset to first slide if visibleCount changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [visibleCount]);

    if (totalItems === 0) {
        return <div className="carousel-empty">No items to display</div>;
    }

    return (
        <div className="carousel">
            <div className="carousel-container">
                <button
                    className="carousel-control carousel-control-prev"
                    onClick={prevSlide}
                    disabled={isTransitioning || totalItems <= actualVisibleCount}
                    aria-label="Previous slide"
                >
                    ‹
                </button>

                <div className="carousel-track">
                    {getVisibleItems().map(({ item, index, position }) => (
                        <div
                            key={index}
                            className={`carousel-item ${
                                position === 0 ? 'prev' :
                                    position === 1 && actualVisibleCount > 1 ? 'current' :
                                        position === 2 && actualVisibleCount > 2 ? 'next' : 'additional'
                            } ${isTransitioning ? 'transitioning' : ''}`}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                <button
                    className="carousel-control carousel-control-next"
                    onClick={nextSlide}
                    disabled={isTransitioning || totalItems <= actualVisibleCount}
                    aria-label="Next slide"
                >
                    ›
                </button>
            </div>

            {/* Indicators */}
            <div className="carousel-indicators">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-indicator ${
                            index === currentIndex ? 'active' : ''
                        }`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
