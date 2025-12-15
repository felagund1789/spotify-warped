import { useState, useCallback } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

interface UseSwipeReturn {
  // Touch event handlers
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  
  // Mouse event handlers for desktop drag simulation
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: React.MouseEvent | React.TouchEvent) => void;
  
  // State
  isDragging: boolean;
  
  // Style props
  style: {
    cursor: string;
    touchAction: string;
    userSelect: 'none';
    WebkitUserSelect: 'none';
    MozUserSelect: 'none';
    msUserSelect: 'none';
  };
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50
}: UseSwipeOptions): UseSwipeReturn {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle touch start
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  }, []);

  // Handle touch move
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [touchStart]);

  // Handle touch end
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  // Handle mouse events for desktop drag simulation
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchStart || !isDragging) return;
    setTouchEnd(e.clientX);
  }, [touchStart, isDragging]);

  const onMouseUp = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  // Prevent context menu on long press (mobile)
  const onContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp, // Same as mouse up
    onContextMenu,
    isDragging,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'pan-y',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }
  };
}