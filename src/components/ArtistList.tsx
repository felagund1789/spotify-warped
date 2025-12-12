import React from 'react'
import { Artist } from '../types'

interface ArtistListProps {
  artists: Artist[]
}

export default function ArtistList({ artists }: ArtistListProps) {
  const artistCardColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ]

  // Generate placeholder avatar based on artist name if no image available
  const getAvatarUrl = (name: string, images?: { url: string }[]) => {
    if (images && images.length > 0) {
      return images[0].url
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=random&color=fff&bold=true&format=svg`
  }

  const artistGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
  }

  const getArtistCardStyle = (index: number): React.CSSProperties => ({
    background: artistCardColors[index] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '16px',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  })

  const avatarStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    flexShrink: 0
  }

  const artistInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0
  }

  const artistNameStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1.1rem',
    marginBottom: '4px',
    position: 'relative',
    zIndex: 1,
    wordWrap: 'break-word',
    lineHeight: '1.2'
  }

  const artistGenresStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    opacity: 0.9,
    fontWeight: 500,
    position: 'relative',
    zIndex: 1,
    wordWrap: 'break-word',
    lineHeight: '1.2'
  }

  return (
    <section className="box">
      <h2>🎤 Top Artists</h2>
      <div style={artistGridStyle}>
        {artists.map((artist, i) => (
          <div 
            key={i} 
            style={getArtistCardStyle(i)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <img 
              src={getAvatarUrl(artist.name, artist.images)} 
              alt={artist.name}
              style={avatarStyle}
            />
            <div style={artistInfoStyle}>
              <div style={artistNameStyle}>{artist.name}</div>
              {artist.genres && artist.genres.length > 0 ? (
                <div style={artistGenresStyle}>{artist.genres.slice(0, 2).join(', ').toUpperCase()}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}