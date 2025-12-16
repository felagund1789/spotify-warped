import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AlbumList from "../src/components/AlbumList";
import { Album, Artist } from "../src/types";

// Mock window.open
Object.defineProperty(window, "open", {
  value: vi.fn(),
  writable: true,
});

const mockArtist: Artist = {
  id: "1",
  name: "Taylor Swift",
  external_urls: { spotify: "https://open.spotify.com/artist/1" },
  href: "",
  type: "artist",
  uri: "spotify:artist:1",
};

const mockAlbums: Album[] = [
  {
    id: "1",
    name: "1989",
    album_type: "album",
    total_tracks: 13,
    available_markets: ["US"],
    external_urls: { spotify: "https://open.spotify.com/album/1" },
    href: "",
    type: "album",
    uri: "spotify:album:1",
    release_date: "2014-10-27",
    release_date_precision: "day",
    images: [
      { url: "https://example.com/1989-large.jpg", height: 640, width: 640 },
      { url: "https://example.com/1989-medium.jpg", height: 300, width: 300 },
      { url: "https://example.com/1989-small.jpg", height: 64, width: 64 },
    ],
    artists: [mockArtist],
  },
  {
    id: "2",
    name: "Abbey Road",
    album_type: "album",
    total_tracks: 17,
    available_markets: ["US"],
    external_urls: { spotify: "https://open.spotify.com/album/2" },
    href: "",
    type: "album",
    uri: "spotify:album:2",
    release_date: "1969-09-26",
    release_date_precision: "day",
    images: [], // No images
    artists: [
      { ...mockArtist, id: "2", name: "The Beatles" },
      { ...mockArtist, id: "3", name: "John Lennon" },
    ],
  },
  {
    id: "3",
    name: "Unknown Album",
    album_type: "album",
    total_tracks: 10,
    available_markets: ["US"],
    external_urls: { spotify: "https://open.spotify.com/album/3" },
    href: "",
    type: "album",
    uri: "spotify:album:3",
    release_date: "2023-01-01",
    release_date_precision: "day",
    images: [
      { url: "https://example.com/unknown-large.jpg", height: 640, width: 640 },
      // Only large image available
    ],
    artists: [], // No artists
  },
];

describe("AlbumList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders album list with header", () => {
    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText("💿 Top Albums")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "💿 Top Albums" })
    ).toBeInTheDocument();
  });

  it("displays all albums", () => {
    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText("1989")).toBeInTheDocument();
    expect(screen.getByText("Abbey Road")).toBeInTheDocument();
    expect(screen.getByText("Unknown Album")).toBeInTheDocument();
  });

  it("displays album images with correct priority", () => {
    render(<AlbumList albums={mockAlbums} />);

    // Should use medium size image (index 1)
    const album1989Image = screen.getByAltText("1989 cover");
    expect(album1989Image).toHaveAttribute(
      "src",
      "https://example.com/1989-medium.jpg"
    );

    // Should fall back to large image when medium not available
    const unknownAlbumImage = screen.getByAltText("Unknown Album cover");
    expect(unknownAlbumImage).toHaveAttribute(
      "src",
      "https://example.com/unknown-large.jpg"
    );
  });

  it("generates placeholder image when no images available", () => {
    render(<AlbumList albums={mockAlbums} />);

    const abbeyRoadImage = screen.getByAltText("Abbey Road cover");
    expect(abbeyRoadImage.getAttribute("src")).toContain("via.placeholder.com");
    expect(abbeyRoadImage.getAttribute("src")).toContain("Ab"); // First 2 chars
  });

  it("displays artist names", () => {
    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
    expect(screen.getByText("The Beatles, John Lennon")).toBeInTheDocument();
  });

  it("handles albums with no artists", () => {
    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
  });

  it("displays release years", () => {
    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("1969")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("opens Spotify URL when album card is clicked", () => {
    render(<AlbumList albums={mockAlbums} />);

    const album1989Card = screen.getByText("1989").closest(".album-card");
    fireEvent.click(album1989Card!);

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/album/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Enter key is pressed", () => {
    render(<AlbumList albums={mockAlbums} />);

    const abbeyRoadCard = screen.getByText("Abbey Road").closest(".album-card");
    fireEvent.keyDown(abbeyRoadCard!, { key: "Enter" });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/album/2",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Space key is pressed", () => {
    render(<AlbumList albums={mockAlbums} />);

    const unknownAlbumCard = screen
      .getByText("Unknown Album")
      .closest(".album-card");
    fireEvent.keyDown(unknownAlbumCard!, { key: " " });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/album/3",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not open URL for other keys", () => {
    render(<AlbumList albums={mockAlbums} />);

    const album1989Card = screen.getByText("1989").closest(".album-card");
    fireEvent.keyDown(album1989Card!, { key: "Tab" });

    expect(window.open).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<AlbumList albums={mockAlbums} />);

    const albumCards = screen.getAllByRole("button");
    expect(albumCards).toHaveLength(3);

    albumCards.forEach((card) => {
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  it("renders empty list gracefully", () => {
    render(<AlbumList albums={[]} />);

    expect(screen.getByText("💿 Top Albums")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("has correct CSS structure", () => {
    const { container } = render(<AlbumList albums={mockAlbums} />);

    expect(container.querySelector(".box")).toBeInTheDocument();
    expect(container.querySelector(".album-header")).toBeInTheDocument();
    expect(container.querySelector(".album-grid")).toBeInTheDocument();
    expect(container.querySelectorAll(".album-card")).toHaveLength(3);
  });

  it("handles albums with single artist", () => {
    const singleArtistAlbum = { ...mockAlbums[0], artists: [mockArtist] };
    render(<AlbumList albums={[singleArtistAlbum]} />);

    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
  });

  it("formats release date correctly", () => {
    const albumWith2000Date = {
      ...mockAlbums[0],
      release_date: "2000-12-31",
    };
    render(<AlbumList albums={[albumWith2000Date]} />);

    expect(screen.getByText("2000")).toBeInTheDocument();
  });
});
