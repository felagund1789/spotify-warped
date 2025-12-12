import React from 'react'

interface Genre {
  name: string
  extra?: string
}

interface GenreListProps {
  genres: Genre[]
}

export default function GenreList({ genres }: GenreListProps) {
  const genreCardColors = [
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  ]

  const genreGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
  }

  const getGenreCardStyle = (index: number): React.CSSProperties => ({
    background: genreCardColors[index] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '16px',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  })

  const genreNameStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1.1rem',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    position: 'relative',
    zIndex: 1
  }

  const genreStatsStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    opacity: 0.9,
    fontWeight: 500,
    position: 'relative',
    zIndex: 1
  }

  return (
    <section className="box">
      <h2>🎵 Top Genres</h2>
      <div style={genreGridStyle}>
        {genres.map((genre, i) => (
          <div 
            key={i} 
            style={getGenreCardStyle(i)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={genreNameStyle}>{genre.name?.toUpperCase()}</div>
            {genre.extra ? <div style={genreStatsStyle}>{genre.extra}</div> : null}
          </div>
        ))}
      </div>
    </section>
  )
}