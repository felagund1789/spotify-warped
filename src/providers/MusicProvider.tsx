import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import { MockService } from '../services/MockService';
import { MusicService, TimeRange } from '../services/MusicService';
import { getAccessToken, SpotifyService } from '../services/SpotifyService';
import { Album, Artist, Track } from '../types';

interface MusicContextType {
  useTopArtists: (limit: number, timeRange: TimeRange) => ReturnType<typeof useQuery<Artist[]>>;
  useTopTracks: (limit: number, timeRange: TimeRange) => ReturnType<typeof useQuery<Track[]>>;
  useTopAlbums: (limit: number, timeRange: TimeRange) => ReturnType<typeof useQuery<Album[]>>;
  useTopGenres: (limit: number, timeRange: TimeRange) => ReturnType<typeof useQuery<{ name: string; extra?: string }[]>>;
}

const MusicContext = createContext<MusicContextType | null>(null);

interface MusicProviderProps {
  children: ReactNode;
  useMockService?: boolean;
}

export function MusicProvider({ children, useMockService = false }: MusicProviderProps) {
  const token = getAccessToken();

  // Create the appropriate service based on configuration
  const createMusicService = (): MusicService => {
    if (useMockService || !token) {
      return new MockService();
    }
    return new SpotifyService(token);
  };

  const musicService = createMusicService();

  // React Query hooks
  const useTopArtists = (limit: number, timeRange: TimeRange) => {
    return useQuery({
      queryKey: ['top-artists', token, limit, timeRange],
      queryFn: () => musicService.getTopArtists(limit, timeRange),
      enabled: !!token || useMockService,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  const useTopTracks = (limit: number, timeRange: TimeRange) => {
    return useQuery({
      queryKey: ['top-tracks', token, limit, timeRange],
      queryFn: () => musicService.getTopTracks(limit, timeRange),
      enabled: !!token || useMockService,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  const useTopAlbums = (limit: number, timeRange: TimeRange) => {
    return useQuery({
      queryKey: ['top-albums', token, limit, timeRange],
      queryFn: () => musicService.getTopAlbums(limit, timeRange),
      enabled: !!token || useMockService,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  const useTopGenres = (limit: number, timeRange: TimeRange) => {
    return useQuery({
      queryKey: ['top-genres', token, limit, timeRange],
      queryFn: () => musicService.getTopGenres(limit, timeRange),
      enabled: !!token || useMockService,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  return (
    <MusicContext.Provider value={{
      useTopArtists,
      useTopTracks,
      useTopAlbums,
      useTopGenres
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}