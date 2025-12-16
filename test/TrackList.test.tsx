import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrackList from "../src/components/TrackList";
import { Album, Artist, Track } from "../src/types";

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

const mockAlbum: Album = {
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
    { url: "https://example.com/1989-small.jpg", height: 160, width: 160 },
  ],
  artists: [mockArtist],
};

const mockTracks: Track[] = [
  {
    id: "1",
    name: "Shake It Off",
    album: mockAlbum,
    artists: [mockArtist],
    available_markets: ["US"],
    disc_number: 1,
    duration_ms: 219200, // 3:39
    explicit: false,
    external_ids: { isrc: "test" },
    external_urls: { spotify: "https://open.spotify.com/track/1" },
    href: "",
    is_playable: true,
    popularity: 95,
    preview_url: null,
    track_number: 6,
    type: "track",
    uri: "spotify:track:1",
    is_local: false,
  },
  {
    id: "2",
    name: "Hey Jude",
    album: {
      ...mockAlbum,
      name: "Past Masters",
      images: [], // No images
    },
    artists: [
      { ...mockArtist, id: "2", name: "The Beatles" },
      { ...mockArtist, id: "3", name: "Paul McCartney" },
    ],
    available_markets: ["US"],
    disc_number: 1,
    duration_ms: 431000, // 7:11
    explicit: false,
    external_ids: { isrc: "test2" },
    external_urls: { spotify: "https://open.spotify.com/track/2" },
    href: "",
    is_playable: true,
    popularity: 90,
    preview_url: null,
    track_number: 8,
    type: "track",
    uri: "spotify:track:2",
    is_local: false,
  },
  {
    id: "3",
    name: "Unknown Track",
    album: {
      ...mockAlbum,
      name: "Unknown Album",
      images: [
        {
          url: "https://example.com/unknown-large.jpg",
          height: 640,
          width: 640,
        },
        // Only large image
      ],
    },
    artists: [], // No artists
    available_markets: ["US"],
    disc_number: 1,
    duration_ms: 60000, // 1:00
    explicit: true,
    external_ids: { isrc: "test3" },
    external_urls: { spotify: "https://open.spotify.com/track/3" },
    href: "",
    is_playable: true,
    popularity: 50,
    preview_url: null,
    track_number: 1,
    type: "track",
    uri: "spotify:track:3",
    is_local: false,
  },
];

describe("TrackList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders track list with header", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByText("🎵 Top Tracks")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "🎵 Top Tracks" })
    ).toBeInTheDocument();
  });

  it("displays all tracks", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByText("Shake It Off")).toBeInTheDocument();
    expect(screen.getByText("Hey Jude")).toBeInTheDocument();
    expect(screen.getByText("Unknown Track")).toBeInTheDocument();
  });

  it("displays track durations correctly formatted", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByText("3:39")).toBeInTheDocument();
    expect(screen.getByText("7:11")).toBeInTheDocument();
    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("formats duration with leading zero for seconds", () => {
    const trackWith5Seconds: Track = {
      ...mockTracks[0],
      duration_ms: 65000, // 1:05
    };

    render(<TrackList tracks={[trackWith5Seconds]} />);

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("displays album images with correct priority", () => {
    render(<TrackList tracks={mockTracks} />);

    // Should use small size image (index 2)
    const shakeItOffImage = screen.getByAltText("1989 cover");
    expect(shakeItOffImage).toHaveAttribute(
      "src",
      "https://example.com/1989-small.jpg"
    );

    // Should fall back to large image when small not available
    const unknownTrackImage = screen.getByAltText("Unknown Album cover");
    expect(unknownTrackImage).toHaveAttribute(
      "src",
      "https://example.com/unknown-large.jpg"
    );
  });

  it("generates placeholder image when no album images available", () => {
    render(<TrackList tracks={mockTracks} />);

    const heyJudeImage = screen.getByAltText("Past Masters cover");
    expect(heyJudeImage.getAttribute("src")).toContain("via.placeholder.com");
    expect(heyJudeImage.getAttribute("src")).toContain("He"); // First 2 chars of track name
  });

  it("displays artist names", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
    expect(screen.getByText("The Beatles, Paul McCartney")).toBeInTheDocument();
  });

  it("handles tracks with no artists", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
  });

  it("opens Spotify URL when track card is clicked", () => {
    render(<TrackList tracks={mockTracks} />);

    const shakeItOffCard = screen
      .getByText("Shake It Off")
      .closest(".track-card");
    fireEvent.click(shakeItOffCard!);

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/track/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Enter key is pressed", () => {
    render(<TrackList tracks={mockTracks} />);

    const heyJudeCard = screen.getByText("Hey Jude").closest(".track-card");
    fireEvent.keyDown(heyJudeCard!, { key: "Enter" });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/track/2",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens Spotify URL when Space key is pressed", () => {
    render(<TrackList tracks={mockTracks} />);

    const unknownTrackCard = screen
      .getByText("Unknown Track")
      .closest(".track-card");
    fireEvent.keyDown(unknownTrackCard!, { key: " " });

    expect(window.open).toHaveBeenCalledWith(
      "https://open.spotify.com/track/3",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not open URL for other keys", () => {
    render(<TrackList tracks={mockTracks} />);

    const shakeItOffCard = screen
      .getByText("Shake It Off")
      .closest(".track-card");
    fireEvent.keyDown(shakeItOffCard!, { key: "Tab" });

    expect(window.open).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<TrackList tracks={mockTracks} />);

    const trackCards = screen.getAllByRole("button");
    expect(trackCards).toHaveLength(3);

    trackCards.forEach((card) => {
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  it("renders empty list gracefully", () => {
    render(<TrackList tracks={[]} />);

    expect(screen.getByText("🎵 Top Tracks")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("has correct CSS structure", () => {
    const { container } = render(<TrackList tracks={mockTracks} />);

    expect(container.querySelector(".box")).toBeInTheDocument();
    expect(container.querySelector(".track-header")).toBeInTheDocument();
    expect(container.querySelector(".track-grid")).toBeInTheDocument();
    expect(container.querySelectorAll(".track-card")).toHaveLength(3);
  });

  it("handles tracks with single artist", () => {
    const singleArtistTrack = { ...mockTracks[0], artists: [mockArtist] };
    render(<TrackList tracks={[singleArtistTrack]} />);

    expect(screen.getByText("Taylor Swift")).toBeInTheDocument();
  });

  it("displays correct album name in alt text", () => {
    render(<TrackList tracks={mockTracks} />);

    expect(screen.getByAltText("1989 cover")).toBeInTheDocument();
    expect(screen.getByAltText("Past Masters cover")).toBeInTheDocument();
    expect(screen.getByAltText("Unknown Album cover")).toBeInTheDocument();
  });
});
