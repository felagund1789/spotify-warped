import React from 'react'
import './GenreList.css'

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
      <h2>🎵 Top Genres</h2>
      <div className="genre-grid">
        {genres.map((genre, i) => (
          <div key={i} className="genre-card">
            <div className="genre-name">{genre.name?.toUpperCase()}</div>
            {genre.extra ? <div className="genre-stats">{genre.extra}</div> : null}
          </div>
        ))}
      </div>
    </section>
  )
}