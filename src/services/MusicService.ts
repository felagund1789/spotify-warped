import { Artist, Track, Album } from '../types';

export type TimeRange = 'long_term' | 'medium_term' | 'short_term';

export interface MusicService {
  getTopArtists(limit: number, timeRange: TimeRange): Promise<Artist[]>;
  getTopTracks(limit: number, timeRange: TimeRange): Promise<Track[]>;
  getTopAlbums(limit: number, timeRange: TimeRange): Promise<Album[]>;
  getTopGenres(limit: number, timeRange: TimeRange): Promise<{ name: string; extra?: string }[]>;
}