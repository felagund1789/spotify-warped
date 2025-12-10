import React, { useEffect, useState } from 'react'
import { getTopArtists, getTopTracks, getTopAlbums, getTopGenres } from '../api/spotify'

type ItemList = { name: string; extra?: string }[]

export default function TopLists({ token }: { token: string }) {
  const [artists, setArtists] = useState<ItemList>([])
  const [tracks, setTracks] = useState<ItemList>([])
  const [albums, setAlbums] = useState<ItemList>([])
  const [genres, setGenres] = useState<ItemList>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      const [a, t, al, g] = await Promise.all([
        getTopArtists(token, 5),
        getTopTracks(token, 5),
        getTopAlbums(token, 5),
        getTopGenres(token, 5)
      ])
      if (!mounted) return
      setArtists(a)
      setTracks(t)
      setAlbums(al)
      setGenres(g)
    }
    load()
    return () => { mounted = false }
  }, [token])

  const box = (title: string, items: ItemList) => (
    <section className="box">
      <h2>{title}</h2>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <strong>{it.name}</strong> {it.extra ? <span className="muted"> — {it.extra}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )

  return (
    <main className="grid">
      {box('Top Genres', genres)}
      {box('Top Artists', artists)}
      {box('Top Albums', albums)}
      {box('Top Tracks', tracks)}
    </main>
  )
}
