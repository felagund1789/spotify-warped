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
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

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

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateCarousel('right'); // Swipe left = go to next item
    } else if (isRightSwipe) {
      navigateCarousel('left'); // Swipe right = go to previous item
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  // Handle mouse events for desktop drag simulation
  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!touchStart || !isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateCarousel('right');
    } else if (isRightSwipe) {
      navigateCarousel('left');
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  // Prevent context menu on long press (mobile)
  const onContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

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
        <div 
          className="carousel-track"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onContextMenu={onContextMenu}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
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
        <span className="desktop-hint">Use ← → arrow keys or click to navigate</span>
        <span className="mobile-hint">Swipe left or right to navigate</span>
      </div>
    </div>
  );
}