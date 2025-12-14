import React, { useEffect, useState, useCallback } from 'react';
import '../styles/Carousel.css';

interface CarouselItem {
  component: React.ReactNode;
  name: string;
}

interface CarouselProps {
  items: CarouselItem[];
  className?: string;
}

export default function Carousel({ items, className = '' }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const navigateCarousel = useCallback((direction: 'left' | 'right' | number) => {
    if (typeof direction === 'number') {
      setActiveIndex(direction);
    } else {
      setActiveIndex(prev => {
        if (direction === 'left') {
          return prev > 0 ? prev - 1 : items.length - 1;
        } else {
          return prev < items.length - 1 ? prev + 1 : 0;
        }
      });
    }
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateCarousel('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateCarousel('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateCarousel]);

  const getItemPosition = (index: number) => {
    const diff = index - activeIndex;
    if (diff === 0) return 'center';
    if (diff === -1 || (diff === items.length - 1 && activeIndex === 0)) return 'left';
    if (diff === 1 || (diff === -(items.length - 1) && activeIndex === items.length - 1)) return 'right';
    return 'hidden';
  };

  return (
    <div className={`carousel-wrapper ${className}`}>
      <div className="carousel">
        <div className="carousel-track">
          {items.map((item, index) => (
            <div
              key={index}
              className={`carousel-item ${getItemPosition(index)}`}
              onClick={() => navigateCarousel(index)}
            >
              {item.component}
            </div>
          ))}
        </div>
      </div>
      
      <div className="carousel-navigation">
        {items.map((item, index) => (
          <button
            key={index}
            className={`nav-button ${activeIndex === index ? 'active' : ''}`}
            onClick={() => navigateCarousel(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="keyboard-hint">
        Use ← → arrow keys or click to navigate
      </div>
    </div>
  );
}