import React, { useEffect, useState, useCallback } from "react";
import { getTopArtists, getTopTracks, getTopGenres } from "../api/mockSpotify";
import GenreList from "./GenreList";
import ArtistList from "./ArtistList";
import TrackList from "./TrackList";

type ItemList = { name: string; extra?: string }[];
import { Artist, Track } from "../types";

export default function TopLists({ token }: { token: string }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<ItemList>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const components = [
    { component: <GenreList genres={genres} />, name: "Genres" },
    { component: <ArtistList artists={artists} />, name: "Artists" },
    { component: <TrackList tracks={tracks} />, name: "Tracks" }
  ];

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [a, t, g] = await Promise.all([
        getTopArtists(token, 5),
        getTopTracks(token, 5),
        getTopGenres(token, 5),
      ]);
      if (!mounted) return;
      setArtists(a);
      setTracks(t);
      setGenres(g);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const navigateCarousel = useCallback((direction: 'left' | 'right' | number) => {
    if (typeof direction === 'number') {
      setActiveIndex(direction);
    } else {
      setActiveIndex(prev => {
        if (direction === 'left') {
          return prev > 0 ? prev - 1 : components.length - 1;
        } else {
          return prev < components.length - 1 ? prev + 1 : 0;
        }
      });
    }
  }, [components.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateCarousel('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateCarousel('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateCarousel]);

  const getItemPosition = (index: number) => {
    const diff = index - activeIndex;
    if (diff === 0) return 'center';
    if (diff === -1 || (diff === components.length - 1 && activeIndex === 0)) return 'left';
    if (diff === 1 || (diff === -(components.length - 1) && activeIndex === components.length - 1)) return 'right';
    return 'hidden';
  };

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <h1>Spotify Warped: A Sonic Journey</h1>
        <p>Twist through time and explore your top tunes</p>
      </div>
      
      <div className="carousel">
        <div className="carousel-track">
          {components.map((item, index) => (
            <div
              key={index}
              className={`carousel-item ${getItemPosition(index)}`}
              onClick={() => navigateCarousel(index)}
            >
              {item.component}
            </div>
          ))}
        </div>
      </div>
      
      <div className="carousel-navigation">
        {components.map((item, index) => (
          <button
            key={index}
            className={`nav-button ${activeIndex === index ? 'active' : ''}`}
            onClick={() => navigateCarousel(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="keyboard-hint">
        Use ← → arrow keys or click to navigate
      </div>
    </div>
  );
}
