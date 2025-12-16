import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GenreList from "../src/components/GenreList";

const mockGenres = [
  { name: "pop", extra: "45%" },
  { name: "rock", extra: "30%" },
  { name: "jazz" }, // No extra data
  { name: "electronic", extra: "15%" },
];

describe("GenreList", () => {
  it("renders genre list with header", () => {
    render(<GenreList genres={mockGenres} />);

    expect(screen.getByText("🎵 Top Genres")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "🎵 Top Genres" })
    ).toBeInTheDocument();
  });

  it("displays all genres", () => {
    render(<GenreList genres={mockGenres} />);

    expect(screen.getByText("Pop")).toBeInTheDocument(); // Capitalized
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getByText("Electronic")).toBeInTheDocument();
  });

  it("capitalizes genre names correctly", () => {
    render(<GenreList genres={[{ name: "alternative rock" }]} />);

    expect(screen.getByText("Alternative rock")).toBeInTheDocument();
  });

  it("displays genre stats when available", () => {
    render(<GenreList genres={mockGenres} />);

    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("does not display stats when not available", () => {
    render(<GenreList genres={[{ name: "jazz" }]} />);

    const jazzCard = screen.getByText("Jazz").closest(".genre-card");
    expect(jazzCard?.querySelector(".genre-stats")).not.toBeInTheDocument();
  });

  it("renders empty list gracefully", () => {
    render(<GenreList genres={[]} />);

    expect(screen.getByText("🎵 Top Genres")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("has correct CSS structure", () => {
    const { container } = render(<GenreList genres={mockGenres} />);

    expect(container.querySelector(".box")).toBeInTheDocument();
    expect(container.querySelector(".genre-header")).toBeInTheDocument();
    expect(container.querySelector(".genre-grid")).toBeInTheDocument();
    expect(container.querySelectorAll(".genre-card")).toHaveLength(4);
  });

  it("renders genre names and stats in correct elements", () => {
    render(<GenreList genres={mockGenres} />);

    const popCard = screen.getByText("Pop").closest(".genre-card");
    expect(popCard?.querySelector(".genre-name")).toHaveTextContent("Pop");
    expect(popCard?.querySelector(".genre-stats")).toHaveTextContent("45%");
  });

  it("handles single character genre names", () => {
    render(<GenreList genres={[{ name: "r&b" }]} />);

    expect(screen.getByText("R&b")).toBeInTheDocument();
  });

  it("handles special characters in genre names", () => {
    render(<GenreList genres={[{ name: "r&b/soul" }]} />);

    expect(screen.getByText("R&b/soul")).toBeInTheDocument();
  });
});
