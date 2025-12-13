import React, { useRef } from 'react';
import { Album } from '../types';
import ShareButton from './ShareButton';
import './AlbumList.css';

interface AlbumListProps {
  albums: Album[]
}

export default function AlbumList({ albums }: AlbumListProps) {
  const cardRef = useRef<HTMLElement>(null);
  
  const getAlbumImage = (album: Album) => {
    if (album.images && album.images.length > 0) {
      // Use medium size image (index 1) or fallback to other sizes
      return album.images[1]?.url || album.images[0]?.url || album.images[2]?.url
    }
    return `https://via.placeholder.com/300x300/1db954/ffffff?text=${encodeURIComponent(album.name.slice(0, 2))}`
  }

  const formatReleaseYear = (releaseDate: string) => {
    return new Date(releaseDate).getFullYear()
  }

  const getArtistNames = (artists: Album['artists']) => {
    return artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'
  }

  return (
    <section className="box" ref={cardRef}>
      <div className="album-header-container">
        <h2 className="album-header">💿 Top Albums</h2>
        <ShareButton 
          data={{
            type: 'albums',
            items: albums
          }}
          cardElement={cardRef}
        />
      </div>
      <div className="album-grid">
        {albums.map((album, i) => (
          <div 
            key={i} 
            className="album-card"
            onClick={() => window.open(album.external_urls?.spotify, '_blank', 'noopener,noreferrer')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.open(album.external_urls?.spotify, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            <img 
              src={getAlbumImage(album)}
              alt={`${album.name} cover`}
              className="album-image"
            />
            <div className="album-info">
              <div className="album-name">{album.name}</div>
              <div className="album-artists">{getArtistNames(album.artists)}</div>
              <div className="album-meta">
                <span className="album-year">{formatReleaseYear(album.release_date)}</span>
                <span className="album-tracks">{album.total_tracks} track{album.total_tracks !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}