import React from 'react'
import ShareButton from './ShareButton'
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
      <div className="genre-header-container">
        <h2 className="genre-header">🎶 Top Genres</h2>
        <ShareButton 
          data={{
            type: 'genres',
            items: genres
          }}
        />
      </div>
      <div className="genre-grid">
        {genres.map((genre, i) => (
          <div key={i} className="genre-card">
            <div className="genre-name">{
              genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
            }</div>
            {genre.extra ? <div className="genre-stats">{genre.extra}</div> : null}
          </div>
        ))}
      </div>
    </section>
  )
}