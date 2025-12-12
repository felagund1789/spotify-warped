import React, { useEffect, useState } from "react";
import { getTopArtists, getTopTracks, getTopGenres } from "../api/mockSpotify";
import GenreList from "./GenreList";
import ArtistList from "./ArtistList";
import TrackList from "./TrackList";

type ItemList = { name: string; extra?: string }[];

export default function TopLists({ token }: { token: string }) {
  const [artists, setArtists] = useState<ItemList>([]);
  const [tracks, setTracks] = useState<ItemList>([]);
  const [genres, setGenres] = useState<ItemList>([]);

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

  return (
    <main className="grid">
      <GenreList genres={genres} />
      <ArtistList artists={artists} />
      <TrackList tracks={tracks} />
    </main>
  );
}
