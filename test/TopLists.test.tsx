import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopLists from "../src/components/TopLists";
import { MusicProvider } from "../src/providers/MusicProvider";

const mockArtists = [{ id: '1', name: 'Artist 1' }];
const mockTracks = [{ id: '1', name: 'Track 1' }];
const mockAlbums = [{ id: '1', name: 'Album 1' }];
const mockGenres = [{ name: 'pop' }];

// Create mock implementations that return the mock data
const mockMusicServiceMethods = {
  getTopArtists: vi.fn(() => Promise.resolve(mockArtists)),
  getTopTracks: vi.fn(() => Promise.resolve(mockTracks)),
  getTopAlbums: vi.fn(() => Promise.resolve(mockAlbums)),
  getTopGenres: vi.fn(() => Promise.resolve(mockGenres))
};

// Mock the services with implementations
vi.mock('../src/services/SpotifyService', () => ({
  SpotifyService: vi.fn(() => mockMusicServiceMethods),
  getAccessToken: vi.fn(() => 'mock-token')
}));

vi.mock('../src/services/MockService', () => ({
  MockService: vi.fn(() => mockMusicServiceMethods)
}));

// Mock child components
vi.mock('../src/components/GenreList', () => ({
  default: ({ genres }: { genres: any[] }) => <div data-testid="genre-list">Genre List ({genres.length} items)</div>
}));

vi.mock('../src/components/ArtistList', () => ({
  default: ({ artists }: { artists: any[] }) => <div data-testid="artist-list">Artist List ({artists.length} items)</div>
}));

vi.mock('../src/components/AlbumList', () => ({
  default: ({ albums }: { albums: any[] }) => <div data-testid="album-list">Album List ({albums.length} items)</div>
}));

vi.mock('../src/components/TrackList', () => ({
  default: ({ tracks }: { tracks: any[] }) => <div data-testid="track-list">Track List ({tracks.length} items)</div>
}));

vi.mock('../src/components/WarpLoading', () => ({
  default: () => <div data-testid="warp-loading">Loading...</div>
}));

vi.mock('../src/components/Carousel', () => ({
  default: ({ items }: { items: any[] }) => (
    <div data-testid="carousel">
      {items.map((item, index) => (
        <div key={index} data-testid={`carousel-item-${item.name.toLowerCase()}`}>
          {item.component}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../src/components/ErrorMessage', () => ({
  default: ({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) => (
    <div data-testid="error-message">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  )
}));

describe("TopLists", () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement, useMockService = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MusicProvider useMockService={useMockService}>
          {component}
        </MusicProvider>
      </QueryClientProvider>
    );
  };

  it("renders title and description", () => {
    renderWithProviders(<TopLists />);

    expect(screen.getByText("Spotify Warped")).toBeInTheDocument();
    expect(
      screen.getByText("Warp through time and revisit your top tunes")
    ).toBeInTheDocument();
  });

  it("renders time range selector buttons", () => {
    renderWithProviders(<TopLists />);

    expect(screen.getByText("1 Year")).toBeInTheDocument();
    expect(screen.getByText("6 Months")).toBeInTheDocument();
    expect(screen.getByText("1 Month")).toBeInTheDocument();
  });

  it("shows 1 Year as active by default", () => {
    renderWithProviders(<TopLists />);

    const yearButton = screen.getByText("1 Year");
    expect(yearButton).toHaveClass("active");
  });

  it("changes time range when button is clicked", async () => {
    renderWithProviders(<TopLists />);

    const sixMonthsButton = screen.getByText("6 Months");
    await user.click(sixMonthsButton);

    expect(sixMonthsButton).toHaveClass("active");
    expect(screen.getByText("1 Year")).not.toHaveClass("active");
  });

  it("shows carousel when all data is loaded", async () => {
    renderWithProviders(<TopLists />);
    
    // Wait for data to load
    await screen.findByTestId('carousel');
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.queryByTestId('warp-loading')).not.toBeInTheDocument();
  });

  it("shows loading when data is loading", () => {
    // Create a new query client with no cache to force loading state
    const freshQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    
    render(
      <QueryClientProvider client={freshQueryClient}>
        <MusicProvider useMockService={true}>
          <TopLists />
        </MusicProvider>
      </QueryClientProvider>
    );
    
    expect(screen.getByTestId('warp-loading')).toBeInTheDocument();
  });

  it("passes data to child components correctly", async () => {
    renderWithProviders(<TopLists />);
    
    // Wait for carousel to appear
    await screen.findByTestId('carousel');
    
    expect(screen.getByTestId('artist-list')).toHaveTextContent('Artist List (1 items)');
    expect(screen.getByTestId('track-list')).toHaveTextContent('Track List (1 items)');
    expect(screen.getByTestId('album-list')).toHaveTextContent('Album List (1 items)');
    expect(screen.getByTestId('genre-list')).toHaveTextContent('Genre List (1 items)');
  });
});
