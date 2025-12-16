import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArtistList from "../src/components/ArtistList";
import { Artist } from "../src/types";

// Mock window.open
Object.defineProperty(window, "open", {
  value: vi.fn(),
  writable: true,
});

const mockArtists: Artist[] = [
  {
    id: "1",
    name: "Taylor Swift",
    external_urls: { spotify: "https://open.spotify.com/artist/1" },
    href: "",
    type: "artist",
    uri: "spotify:artist:1",
    images: [
      { url: "https://example.com/taylor.jpg", height: 300, width: 300 },
    ],
    genres: ["pop", "country"],
    popularity: 90,
  },
  {
    id: "2",
    name: "The Beatles",
    external_urls: { spotify: "https://open.spotify.com/artist/2" },
    href: "",
    type: "artist",
    uri: "spotify:artist:2",
    images: [],
    genres: ["rock", "pop"],
    popularity: 95,
  },
  {
    id: "3",
    name: "Unknown Artist",
    external_urls: { spotify: "https://open.spotify.com/artist/3" },
    href: "",
    type: "artist",
    uri: "spotify:artist:3",
    // No images or genres
  },
];

describe("ArtistList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders artist list with header", () => {
    render(<ArtistList artists={mockArtists} />);

    expect(screen.getByText("🎤 Top Artists")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "🎤 Top Artists" })
    ).toBeInTheDocument();
  });

  it("displays all artists", () => {
    render(<ArtistList artists={mockArtists} />);

    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
    expect(screen.getByText("The Beatles")).toBeInTheDocument();
    expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
  });

  it("displays artist images when available", () => {
    render(<ArtistList artists={mockArtists} />);

    const taylorImage = screen.getByAltText("Taylor Swift");
    expect(taylorImage).toHaveAttribute(
      "src",
      "https://example.com/taylor.jpg"
    );
  });

  it("generates placeholder avatar when no image available", () => {
    render(<ArtistList artists={mockArtists} />);

    const beatlesImage = screen.getByAltText("The Beatles");
    expect(beatlesImage.getAttribute("src")).toContain("ui-avatars.com");
    expect(beatlesImage.getAttribute("src")).toContain("The%20Beatles");
  });

  it("displays artist genres when available", () => {
    render(<ArtistList artists={mockArtists} />);

    expect(screen.getByText("Pop, Country")).toBeInTheDocument();
    expect(screen.getByText("Rock, Pop")).toBeInTheDocument();
  });

  it("limits genres to first 2", () => {
    const artistWithManyGenres: Artist = {
      ...mockArtists[0],
      genres: ["pop", "country", "folk", "alternative"],
    };

    render(<ArtistList artists={[artistWithManyGenres]} />);

    expect(screen.getByText("Pop, Country")).toBeInTheDocument();
    expect(screen.queryByText("folk")).not.toBeInTheDocument();
  });

  it("does not display genres when not available", () => {
    render(<ArtistList artists={[mockArtists[2]]} />);

    const artistCard = screen
      .getByText("Unknown Artist")
      .closest(".artist-card");
    expect(artistCard?.querySelector(".artist-genres")).not.toBeInTheDocument();
  });

  it("capitalizes genre names", () => {
    render(<ArtistList artists={mockArtists} />);

    expect(screen.getByText("Pop, Country")).toBeInTheDocument();
    expect(screen.getByText("Rock, Pop")).toBeInTheDocument();
  });

  it("opens Spotify URL when artist card is clicked", () => {
    render(<ArtistList artists={mockArtists} />);

    const taylorCard = screen.getByText("Taylor Swift").closest(".artist-card");
    fireEvent.click(taylorCard!);

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/artist/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Enter key is pressed", () => {
    render(<ArtistList artists={mockArtists} />);

    const taylorCard = screen.getByText("Taylor Swift").closest(".artist-card");
    fireEvent.keyDown(taylorCard!, { key: "Enter" });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/artist/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Space key is pressed", () => {
    render(<ArtistList artists={mockArtists} />);

    const beatlesCard = screen.getByText("The Beatles").closest(".artist-card");
    fireEvent.keyDown(beatlesCard!, { key: " " });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/artist/2",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not open URL for other keys", () => {
    render(<ArtistList artists={mockArtists} />);

    const taylorCard = screen.getByText("Taylor Swift").closest(".artist-card");
    fireEvent.keyDown(taylorCard!, { key: "Tab" });

    expect(window.open).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<ArtistList artists={mockArtists} />);

    const artistCards = screen.getAllByRole("button");
    expect(artistCards).toHaveLength(3);

    artistCards.forEach((card) => {
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  it("renders empty list gracefully", () => {
    render(<ArtistList artists={[]} />);

    expect(screen.getByText("🎤 Top Artists")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("has correct CSS structure", () => {
    const { container } = render(<ArtistList artists={mockArtists} />);

    expect(container.querySelector(".box")).toBeInTheDocument();
    expect(container.querySelector(".artist-header")).toBeInTheDocument();
    expect(container.querySelector(".artist-grid")).toBeInTheDocument();
    expect(container.querySelectorAll(".artist-card")).toHaveLength(3);
  });
});
