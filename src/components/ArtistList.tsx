import React from 'react'

interface Artist {
  name: string
  extra?: string
}

interface ArtistListProps {
  artists: Artist[]
}

export default function ArtistList({ artists }: ArtistListProps) {
  return (
    <section className="box">
      <h2>Top Artists</h2>
      <ol>
        {artists.map((artist, i) => (
          <li key={i}>
            <strong>{artist.name}</strong>
            {artist.extra ? <span className="muted"> — {artist.extra}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}