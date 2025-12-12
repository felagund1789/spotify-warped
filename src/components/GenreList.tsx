import React from 'react'

interface Genre {
  name: string
  extra?: string
}

interface GenreListProps {
  genres: Genre[]
}

export default function GenreList({ genres }: GenreListProps) {
  return (
    <section className="box">
      <h2>Top Genres</h2>
      <ol>
        {genres.map((genre, i) => (
          <li key={i}>
            <strong>{genre.name}</strong> 
            {genre.extra ? <span className="muted"> — {genre.extra}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}