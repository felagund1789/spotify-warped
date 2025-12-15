import { useState } from "react";
import { useTopArtists, useTopTracks, useTopGenres, useTopAlbums } from "../api/spotify";
import GenreList from "./GenreList";
import ArtistList from "./ArtistList";
import TrackList from "./TrackList";
import AlbumList from "./AlbumList";
import WarpLoading from "./WarpLoading";
import Carousel from "./Carousel";

type ItemList = { name: string; extra?: string }[];
import { Artist, Track, Album } from "../types";

type TimeRange = 'long_term' | 'medium_term' | 'short_term';

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'long_term', label: '1 Year' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'short_term', label: '1 Month' }
];

export default function TopLists({ token }: { token: string }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  
  // Use React Query hooks for data fetching
  const artistsQuery = useTopArtists(token, 5, timeRange);
  const tracksQuery = useTopTracks(token, 5, timeRange);
  const albumsQuery = useTopAlbums(token, 5, timeRange);
  const genresQuery = useTopGenres(token, 5, timeRange);
  
  // Extract data from queries
  const artists = artistsQuery.data || [];
  const tracks = tracksQuery.data || [];
  const albums = albumsQuery.data || [];
  const genres = genresQuery.data || [];
  
  // Check loading state
  const isLoading = artistsQuery.isLoading || tracksQuery.isLoading || albumsQuery.isLoading || genresQuery.isLoading;
  const hasError = artistsQuery.error || tracksQuery.error || albumsQuery.error || genresQuery.error;

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
    console.error('Error loading data:', hasError);
  }

  return (
    <div className="carousel-container">
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
      
      {isLoading || !isDataReady ? (
        <WarpLoading />
      ) : (
        <Carousel items={carouselItems} />
      )}
    </div>
  );
}
