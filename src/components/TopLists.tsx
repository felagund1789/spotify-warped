import { useState } from "react";
import { useMusic } from "../providers/MusicProvider";
import { TimeRange } from "../services/MusicService";
import AlbumList from "./AlbumList";
import ArtistList from "./ArtistList";
import Carousel from "./Carousel";
import { DemoBanner } from "./DemoBanner";
import ErrorMessage from "./ErrorMessage";
import GenreList from "./GenreList";
import TrackList from "./TrackList";
import WarpLoading from "./WarpLoading";

type ItemList = { name: string; extra?: string }[];

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'long_term', label: '1 Year' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'short_term', label: '1 Month' }
];

export default function TopLists() {
  const { useTopArtists, useTopTracks, useTopAlbums, useTopGenres } = useMusic();
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const [retryKey, setRetryKey] = useState(0);
  
  // Use React Query hooks for data fetching
  const artistsQuery = useTopArtists(5, timeRange);
  const tracksQuery = useTopTracks(5, timeRange);
  const albumsQuery = useTopAlbums(5, timeRange);
  const genresQuery = useTopGenres(5, timeRange);
  
  // Extract data from queries
  const artists = artistsQuery.data || [];
  const tracks = tracksQuery.data || [];
  const albums = albumsQuery.data || [];
  const genres = genresQuery.data || [];
  
  // Check loading state
  const isLoading = artistsQuery.isLoading || tracksQuery.isLoading || albumsQuery.isLoading || genresQuery.isLoading;
  const hasError = artistsQuery.error || tracksQuery.error || albumsQuery.error || genresQuery.error;
  
  // Retry function to refetch all queries
  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    artistsQuery.refetch();
    tracksQuery.refetch();
    albumsQuery.refetch();
    genresQuery.refetch();
  };

  // Prepare carousel items
  const carouselItems = [
    { component: <ArtistList artists={artists} />, name: "Artists" },
    { component: <AlbumList albums={albums} />, name: "Albums" },
    { component: <TrackList tracks={tracks} />, name: "Tracks" },
    { component: <GenreList genres={genres} />, name: "Genres" }
  ];

  // Check if all data is loaded
  const isDataReady = artists.length > 0 && tracks.length > 0 && albums.length > 0 && genres.length > 0;

  // Show error state if any query fails
  if (hasError) {
    return (
      <ErrorMessage 
        title="Unable to Load Your Music Data"
        message="We're having trouble connecting to Spotify. Please check your connection and try again."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="carousel-container">
      <DemoBanner />
      <div className="carousel-header">
        <h1>Spotify Warped</h1>
        <p>Warp through time and revisit your top tunes</p>
        
        <div className="time-range-selector">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`time-range-btn ${timeRange === option.value ? 'active' : ''}`}
              onClick={() => setTimeRange(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <WarpLoading />
      ) : (
        <Carousel items={carouselItems} />
      )}
    </div>
  );
}
