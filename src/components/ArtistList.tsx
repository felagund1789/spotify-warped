import { Artist } from '../types';
import '../styles/ArtistList.css';

interface ArtistListProps {
  artists: Artist[]
}

export default function ArtistList({ artists }: ArtistListProps) {
  // Generate placeholder avatar based on artist name if no image available
  const getAvatarUrl = (name: string, images?: { url: string }[]) => {
    if (images && images.length > 0) {
      return images[0].url
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=random&color=fff&bold=true&format=svg`
  }

  return (
    <section className="box">
      <h2 className="artist-header">🎤 Top Artists</h2>
      <div className="artist-grid">
        {artists.map((artist, i) => (
          <div 
            key={i} 
            className="artist-card"
            onClick={() => window.open(artist.external_urls?.spotify, '_blank', 'noopener,noreferrer')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.open(artist.external_urls?.spotify, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            <img 
              src={getAvatarUrl(artist.name, artist.images)} 
              alt={artist.name}
              className="artist-avatar"
            />
            <div className="artist-info">
              <div className="artist-name">{artist.name}</div>
              {artist.genres && artist.genres.length > 0 ? (
                <div className="artist-genres">{
                  artist.genres.slice(0, 2)
                    .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1))
                    .join(', ')
                  }</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}