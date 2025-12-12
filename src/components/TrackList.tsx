import React from 'react'
import { Track } from '../types'

interface TrackListProps {
  tracks: Track[]
}

export default function TrackList({ tracks }: TrackListProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getAlbumImage = (track: Track) => {
    if (track.album?.images && track.album.images.length > 0) {
      // Use smallest image (index 2) or fallback to larger sizes
      return track.album.images[2]?.url || track.album.images[1]?.url || track.album.images[0]?.url
    }
    return `https://via.placeholder.com/160x160/1db954/ffffff?text=${encodeURIComponent(track.name.slice(0, 2))}`
  }

  const trackGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
  }

  const trackCardColors = [
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  ]

  const getTrackCardStyle = (index: number): React.CSSProperties => ({
    background: trackCardColors[index] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px'
  })

  const albumImageStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0
  }

  const trackInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }

  const trackNameStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '4px',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const artistNameStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '2px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const albumNameStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }

  const durationStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 600,
    minWidth: '35px',
    textAlign: 'right' as const
  }

  return (
    <section className="box">
      <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#ffffff' }}>🎵 Top Tracks</h2>
      <div style={trackGridStyle}>
        {tracks.map((track, i) => (
          <div 
            key={i} 
            style={getTrackCardStyle(i)}
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
              src={getAlbumImage(track)}
              alt={`${track.album?.name} cover`}
              style={albumImageStyle}
            />
            <div style={trackInfoStyle}>
              <div style={trackNameStyle}>{track.name}</div>
              <div style={artistNameStyle}>
                {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
              </div>
              <div style={albumNameStyle}>
                {track.album?.name || 'Unknown Album'}
              </div>
            </div>
            <div style={durationStyle}>
              {formatDuration(track.duration_ms || 0)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}