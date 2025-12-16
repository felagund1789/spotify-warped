import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorMessage from "../src/components/ErrorMessage";

describe("ErrorMessage", () => {
  it("renders with default props", () => {
    render(<ErrorMessage />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We couldn't load your data. Please try again later.")
    ).toBeInTheDocument();
  });

  it("renders with custom title and message", () => {
    const customTitle = "Network Error";
    const customMessage = "Unable to connect to the server";

    render(<ErrorMessage title={customTitle} message={customMessage} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    const handleRetry = vi.fn();

    render(<ErrorMessage onRetry={handleRetry} />);

    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("does not show retry button when onRetry is not provided", () => {
    render(<ErrorMessage />);

    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const handleRetry = vi.fn();

    render(<ErrorMessage onRetry={handleRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("has correct CSS classes", () => {
    const { container } = render(<ErrorMessage />);

    expect(container.firstChild).toHaveClass("error-message");
    expect(
      screen.getByText("Something went wrong").closest(".error-content")
    ).toBeInTheDocument();
  });

  it("displays error icon", () => {
    render(<ErrorMessage />);

    const errorIcon = screen
      .getByText("Something went wrong")
      .closest(".error-content")
      ?.querySelector(".error-icon svg");
    expect(errorIcon).toBeInTheDocument();
  });

  it("displays retry icon when retry button is present", () => {
    const handleRetry = vi.fn();

    render(<ErrorMessage onRetry={handleRetry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    const retryIcon = retryButton.querySelector("svg");
    expect(retryIcon).toBeInTheDocument();
  });
});
