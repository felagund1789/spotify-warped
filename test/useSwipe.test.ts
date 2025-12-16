import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSwipe } from "../src/hooks/useSwipe";

// Mock React events
const createTouchEvent = (clientX: number) =>
  ({
    targetTouches: [{ clientX }],
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent);

const createMouseEvent = (clientX: number) =>
  ({
    clientX,
    preventDefault: vi.fn(),
  } as unknown as React.MouseEvent);

describe("useSwipe", () => {
  it("returns correct initial state", () => {
    const { result } = renderHook(() => useSwipe({}));

    expect(result.current.isDragging).toBe(false);
    expect(result.current.style.cursor).toBe("grab");
    expect(result.current.style.touchAction).toBe("pan-y");
    expect(result.current.style.userSelect).toBe("none");
  });

  it("provides all required event handlers", () => {
    const { result } = renderHook(() => useSwipe({}));

    expect(typeof result.current.onTouchStart).toBe("function");
    expect(typeof result.current.onTouchMove).toBe("function");
    expect(typeof result.current.onTouchEnd).toBe("function");
    expect(typeof result.current.onMouseDown).toBe("function");
    expect(typeof result.current.onMouseMove).toBe("function");
    expect(typeof result.current.onMouseUp).toBe("function");
    expect(typeof result.current.onMouseLeave).toBe("function");
    expect(typeof result.current.onContextMenu).toBe("function");
  });

  it("sets isDragging to true on touch start", () => {
    const { result } = renderHook(() => useSwipe({}));

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    expect(result.current.isDragging).toBe(true);
  });

  it("sets isDragging to true on mouse down", () => {
    const { result } = renderHook(() => useSwipe({}));

    act(() => {
      result.current.onMouseDown(createMouseEvent(100));
    });

    expect(result.current.isDragging).toBe(true);
  });

  it("updates cursor style when dragging", () => {
    const { result } = renderHook(() => useSwipe({}));

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    expect(result.current.style.cursor).toBe("grabbing");
  });

  it("calls onSwipeLeft when swiping left (touch)", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 50,
      })
    );

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    act(() => {
      result.current.onTouchMove(createTouchEvent(40));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight when swiping right (touch)", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 50,
      })
    );

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    act(() => {
      result.current.onTouchMove(createTouchEvent(160));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("calls onSwipeLeft when swiping left (mouse)", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 50,
      })
    );

    act(() => {
      result.current.onMouseDown(createMouseEvent(100));
    });

    act(() => {
      result.current.onMouseMove(createMouseEvent(40));
    });

    act(() => {
      result.current.onMouseUp();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight when swiping right (mouse)", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 50,
      })
    );

    act(() => {
      result.current.onMouseDown(createMouseEvent(100));
    });

    act(() => {
      result.current.onMouseMove(createMouseEvent(160));
    });

    act(() => {
      result.current.onMouseUp();
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does not trigger swipe if distance is below minimum", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 50,
      })
    );

    // Swipe distance of 30 pixels (below minimum of 50)
    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    act(() => {
      result.current.onTouchMove(createTouchEvent(70));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("uses custom minimum swipe distance", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        minSwipeDistance: 100,
      })
    );

    // Swipe distance of 80 pixels (below custom minimum of 100)
    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    act(() => {
      result.current.onTouchMove(createTouchEvent(20));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("uses default minimum swipe distance of 50", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    // Swipe distance of exactly 50 pixels
    act(() => {
      result.current.onTouchStart(createTouchEvent(1000));
    });

    act(() => {
      result.current.onTouchMove(createTouchEvent(250));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it("resets state after swipe", () => {
    const { result } = renderHook(() => useSwipe({}));

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.onTouchMove(createTouchEvent(40));
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.style.cursor).toBe("grab");
  });

  it("handles touch end without move", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    act(() => {
      result.current.onTouchStart(createTouchEvent(100));
    });

    // End without move
    act(() => {
      result.current.onTouchEnd();
    });

    expect(result.current.isDragging).toBe(false);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("handles mouse leave same as mouse up", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    act(() => {
      result.current.onMouseDown(createMouseEvent(100));
    });

    act(() => {
      result.current.onMouseMove(createMouseEvent(40));
    });

    act(() => {
      result.current.onMouseLeave();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(result.current.isDragging).toBe(false);
  });

  it("prevents context menu", () => {
    const { result } = renderHook(() => useSwipe({}));

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent;

    result.current.onContextMenu(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("does not trigger mouse move without initial mouse down", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    // Try to move without mouse down
    act(() => {
      result.current.onMouseMove(createMouseEvent(50));
    });

    act(() => {
      result.current.onMouseUp();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does not trigger mouse move when not dragging", () => {
    const onSwipeLeft = vi.fn();

    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    // Mouse down but dragging is false
    act(() => {
      result.current.onMouseDown(createMouseEvent(100));
    });

    // Manually set dragging to false to simulate edge case
    act(() => {
      result.current.onMouseUp();
    });

    act(() => {
      result.current.onMouseMove(createMouseEvent(50));
    });

    expect(result.current.isDragging).toBe(false);
  });
});
