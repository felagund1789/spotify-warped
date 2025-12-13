import React, { useEffect, useState } from "react";
import { getTopArtists, getTopTracks, getTopGenres, getTopAlbums } from "../api/spotify";
import GenreList from "./GenreList";
import ArtistList from "./ArtistList";
import TrackList from "./TrackList";
import AlbumList from "./AlbumList";
import WarpLoading from "./WarpLoading";
import Carousel from "./Carousel";

type ItemList = { name: string; extra?: string }[];
import { Artist, Track, Album } from "../types";

export default function TopLists({ token }: { token: string }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<ItemList>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          getTopArtists(token, 5),
          getTopTracks(token, 5),
          getTopAlbums(token, 5),
          getTopGenres(token, 5),
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
  }, [token]);

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <h1>Spotify Warped</h1>
        <p>Warp through time and revisit your top tunes</p>
      </div>
      
      {isLoading || !isDataReady ? (
        <WarpLoading />
      ) : (
        <Carousel items={carouselItems} />
      )}
    </div>
  );
}
