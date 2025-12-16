import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WarpLoading from "../src/components/WarpLoading";

describe("WarpLoading", () => {
  it("renders loading component", () => {
    const { container } = render(<WarpLoading />);

    expect(container.firstChild).toHaveClass("warp-loading");
  });

  it("displays warp tunnel effect", () => {
    render(<WarpLoading />);

    const warpTunnel = screen
      .getByText("W")
      .closest(".warp-loading")
      ?.querySelector(".warp-tunnel");
    expect(warpTunnel).toBeInTheDocument();
  });

  it("displays correct number of warp lines", () => {
    render(<WarpLoading />);

    const warpLines = screen
      .getByText("W")
      .closest(".warp-loading")
      ?.querySelectorAll(".warp-line");
    expect(warpLines).toHaveLength(8);
  });

  it("displays WARPING text", () => {
    render(<WarpLoading />);

    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
    expect(screen.getByText("I")).toBeInTheDocument();
    expect(screen.getByText("N")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
  });

  it("displays loading dots", () => {
    render(<WarpLoading />);

    const loadingDots = screen
      .getByText("W")
      .closest(".warp-loading")
      ?.querySelector(".loading-dots");
    expect(loadingDots).toBeInTheDocument();

    const dots = loadingDots?.querySelectorAll("span");
    expect(dots).toHaveLength(3);
    dots?.forEach((dot) => {
      expect(dot).toHaveTextContent(".");
    });
  });

  it("has correct CSS structure", () => {
    const { container } = render(<WarpLoading />);

    expect(container.querySelector(".warp-loading")).toBeInTheDocument();
    expect(container.querySelector(".warp-tunnel")).toBeInTheDocument();
    expect(container.querySelector(".loading-text")).toBeInTheDocument();
    expect(container.querySelector(".loading-dots")).toBeInTheDocument();
  });

  it("each letter is wrapped in a span", () => {
    render(<WarpLoading />);

    const loadingText = screen.getByText("W").closest(".loading-text");
    const letterSpans = loadingText?.querySelectorAll(
      "span:not(.loading-dots span)"
    );
    expect(letterSpans).toHaveLength(7); // W-A-R-P-I-N-G
  });
});
