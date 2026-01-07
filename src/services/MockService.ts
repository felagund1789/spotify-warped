import { MusicService, TimeRange } from './MusicService';
import { Artist, Track, Album } from '../types';

// Mock data
import { default as mockArtists } from '../data/artists';
import { default as mockTracks } from '../data/tracks';

export class MockService implements MusicService {
  private simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // 500-1500ms delay
  }

  async getTopArtists(limit: number, timeRange: TimeRange): Promise<Artist[]> {
    await this.simulateDelay();
    return mockArtists.slice(0, limit);
  }

  async getTopTracks(limit: number, timeRange: TimeRange): Promise<Track[]> {
    await this.simulateDelay();
    return mockTracks.slice(0, limit);
  }

  async getTopAlbums(limit: number, timeRange: TimeRange): Promise<Album[]> {
    const allTracks = await this.getTopTracks(500, timeRange); // Simulate fetching many tracks
    // Count album occurrences and track album data
    const albumCounts: Record<string, { album: Album; count: number }> = {}
    
    allTracks.forEach((track, i) => {
      if (track.album && track.album.id) {
        const albumId = track.album.id
        
        if (albumCounts[albumId]) {
          albumCounts[albumId].count += (allTracks.length - i) // Use reverse index to prioritize earlier albums
        } else {
          albumCounts[albumId] = {
            album: track.album,
            count: allTracks.length - i // Use reverse index to prioritize earlier albums
          }
        }
      }
    })
    
    // Sort albums by track count (descending) and return top albums
    const sortedAlbums = Object.values(albumCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => entry.album)
    
    console.log(`Found ${Object.keys(albumCounts).length} unique albums, returning top ${sortedAlbums.length}`)
    
    return sortedAlbums
  }

  async getTopGenres(limit: number, timeRange: TimeRange): Promise<{ name: string; extra?: string }[]> {
    await this.simulateDelay();
    
    const genres = [
      { name: 'pop', extra: '45%' },
      { name: 'dance pop', extra: '25%' },
      { name: 'electropop', extra: '15%' },
      { name: 'art pop', extra: '10%' },
      { name: 'indie pop', extra: '5%' }
    ];
    
    return genres.slice(0, limit);
  }
}