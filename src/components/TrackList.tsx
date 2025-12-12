import React from 'react'
import { Track } from '../types'
import './TrackList.css'

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

  return (
    <section className="box">
      <h2 className="track-header">🎵 Top Tracks</h2>
      <div className="track-grid">
        {tracks.map((track, i) => (
          <div key={i} className="track-card">
            <img 
              src={getAlbumImage(track)}
              alt={`${track.album?.name} cover`}
              className="album-image"
            />
            <div className="track-info">
              <div className="track-name">{track.name}</div>
              <div className="artist-name">
                {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
              </div>
              <div className="album-name">
                {track.album?.name || 'Unknown Album'}
              </div>
            </div>
            <div className="track-duration">
              {formatDuration(track.duration_ms || 0)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}