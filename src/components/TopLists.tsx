import { useEffect, useState } from "react";
import { getTopArtists, getTopTracks, getTopGenres, getTopAlbums } from "../api/spotify";
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
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<ItemList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');

  // Prepare carousel items
  const carouselItems = [
    { component: <ArtistList artists={artists} />, name: "Artists" },
    { component: <AlbumList albums={albums} />, name: "Albums" },
    { component: <TrackList tracks={tracks} />, name: "Tracks" },
    { component: <GenreList genres={genres} />, name: "Genres" }
  ];

  // Check if all data is loaded
  const isDataReady = artists.length > 0 && tracks.length > 0 && albums.length > 0 && genres.length > 0;

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    async function load() {
      try {
        const [a, t, al, g] = await Promise.all([
          getTopArtists(token, 5, timeRange),
          getTopTracks(token, 5, timeRange),
          getTopAlbums(token, 5, timeRange),
          getTopGenres(token, 5, timeRange),
        ]);
        if (!mounted) return;
        setArtists(a);
        setTracks(t);
        setAlbums(al);
        setGenres(g);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mounted) {
          // Add a small delay to show the loading effect
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token, timeRange]);

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
