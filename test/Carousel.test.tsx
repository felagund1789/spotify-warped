import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Carousel from "../src/components/Carousel";
import { useSwipe } from "../src/hooks";

// Mock the useSwipe hook
vi.mock("../src/hooks", () => ({
  useSwipe: vi.fn(() => ({
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
    onMouseDown: vi.fn(),
    onMouseMove: vi.fn(),
    onMouseUp: vi.fn(),
    onMouseLeave: vi.fn(),
    onContextMenu: vi.fn(),
    isDragging: false,
    style: {
      cursor: "grab",
      touchAction: "pan-y",
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
    },
  })),
}));

const mockItems = [
  {
    component: <div>Genre Component</div>,
    name: "Genres",
  },
  {
    component: <div>Artist Component</div>,
    name: "Artists",
  },
  {
    component: <div>Album Component</div>,
    name: "Albums",
  },
  {
    component: <div>Track Component</div>,
    name: "Tracks",
  },
];

describe("Carousel", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders carousel with items", () => {
    render(<Carousel items={mockItems} />);

    expect(screen.getByText("Genre Component")).toBeInTheDocument();
    expect(screen.getByText("Artist Component")).toBeInTheDocument();
    expect(screen.getByText("Album Component")).toBeInTheDocument();
    expect(screen.getByText("Track Component")).toBeInTheDocument();
  });

  it("renders navigation buttons for each item", () => {
    render(<Carousel items={mockItems} />);

    expect(screen.getByRole("button", { name: "Genres" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Albums" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tracks" })).toBeInTheDocument();
  });

  it("shows first item as active by default", () => {
    render(<Carousel items={mockItems} />);

    const genresButton = screen.getByRole("button", { name: "Genres" });
    expect(genresButton).toHaveClass("active");
  });

  it("changes active item when navigation button is clicked", async () => {
    render(<Carousel items={mockItems} />);

    const artistsButton = screen.getByRole("button", { name: "Artists" });
    await user.click(artistsButton);

    expect(artistsButton).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Genres" })).not.toHaveClass(
      "active"
    );
  });

  it("navigates to previous item with left arrow key", async () => {
    render(<Carousel items={mockItems} />);

    // Start at first item, pressing left should go to last item
    fireEvent.keyDown(window, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Tracks" })).toHaveClass(
        "active"
      );
    });
  });

  it("navigates to next item with right arrow key", async () => {
    render(<Carousel items={mockItems} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Artists" })).toHaveClass(
        "active"
      );
    });
  });

  it("cycles from last to first item when navigating right", async () => {
    render(<Carousel items={mockItems} />);

    // Click on last item first
    await user.click(screen.getByRole("button", { name: "Tracks" }));

    // Then navigate right to go back to first
    fireEvent.keyDown(window, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Genres" })).toHaveClass(
        "active"
      );
    });
  });

  it("ignores other keys", () => {
    render(<Carousel items={mockItems} />);

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Space" });
    fireEvent.keyDown(window, { key: "Tab" });

    // Should still be on first item
    expect(screen.getByRole("button", { name: "Genres" })).toHaveClass(
      "active"
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <Carousel items={mockItems} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("carousel-wrapper");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("calls useSwipe hook with correct callbacks", () => {
    render(<Carousel items={mockItems} />);

    expect(useSwipe).toHaveBeenCalledWith({
      onSwipeLeft: expect.any(Function),
      onSwipeRight: expect.any(Function),
      minSwipeDistance: 50,
    });
  });

  it("handles empty items array gracefully", () => {
    render(<Carousel items={[]} />);

    expect(screen.queryByText("Genre Component")).not.toBeInTheDocument();
  });

  it("displays keyboard and mobile hints", () => {
    render(<Carousel items={mockItems} />);

    expect(
      screen.getByText("Use ← → arrow keys or click to navigate")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Swipe left or right to navigate")
    ).toBeInTheDocument();
  });

  it("positions items correctly based on active index", () => {
    render(<Carousel items={mockItems} />);

    // First item should be center
    const genreItem = screen
      .getByText("Genre Component")
      .closest(".carousel-item");
    expect(genreItem).toHaveClass("center");

    // Second item should be right
    const artistItem = screen
      .getByText("Artist Component")
      .closest(".carousel-item");
    expect(artistItem).toHaveClass("right");

    // Last item should be left when first is active
    const trackItem = screen
      .getByText("Track Component")
      .closest(".carousel-item");
    expect(trackItem).toHaveClass("left");
  });

  it("updates item positions when active index changes", async () => {
    render(<Carousel items={mockItems} />);

    // Click on Artists to make it active
    await user.click(screen.getByRole("button", { name: "Artists" }));

    // Now Artist should be center
    const artistItem = screen
      .getByText("Artist Component")
      .closest(".carousel-item");
    expect(artistItem).toHaveClass("center");

    // Genre should be left
    const genreItem = screen
      .getByText("Genre Component")
      .closest(".carousel-item");
    expect(genreItem).toHaveClass("left");
  });

  it("allows clicking on carousel items to navigate", async () => {
    render(<Carousel items={mockItems} />);

    // Click directly on the album component
    const albumItem = screen
      .getByText("Album Component")
      .closest(".carousel-item");
    await user.click(albumItem!);

    expect(screen.getByRole("button", { name: "Albums" })).toHaveClass(
      "active"
    );
  });

  it("prevents default behavior for arrow key events", () => {
    render(<Carousel items={mockItems} />);

    const leftArrowEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const rightArrowEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });

    const preventDefaultSpy = vi.spyOn(leftArrowEvent, "preventDefault");
    const preventDefaultSpy2 = vi.spyOn(rightArrowEvent, "preventDefault");

    window.dispatchEvent(leftArrowEvent);
    window.dispatchEvent(rightArrowEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(preventDefaultSpy2).toHaveBeenCalled();
  });

  it("cleans up keyboard event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<Carousel items={mockItems} />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});
