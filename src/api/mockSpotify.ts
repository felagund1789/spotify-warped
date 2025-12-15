/**
 * Mock Spotify API implementation for development and testing
 * Provides the same React Query hook interface as spotify.ts but with sample data
 */

import { useQuery } from '@tanstack/react-query'
import mockArtists from "../data/artists";
import mockTracks from "../data/tracks";
import { Artist, Album } from "../types";

// Mock authentication functions (no-op implementations)
export async function startAuthIfNeeded() {
  console.log("Mock: Authentication not required");
}

export async function handleCallback() {
  console.log("Mock: No callback handling needed");
}

export function getAccessToken(): string | null {
  return "mock-token"; // Always return a mock token
}

export function logout() {
  console.log("Mock: Logout called");
}

// React Query hook for mock top artists
export function useTopArtists(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-artists', token, limit, time_range],
    queryFn: async (): Promise<Artist[]> => {
      console.log(`Mock: Fetching top ${limit} artists for ${time_range}`);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockArtists.slice(0, limit);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// React Query hook for mock top tracks
export function useTopTracks(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-tracks', token, limit, time_range],
    queryFn: async () => {
      console.log(`Mock: Fetching top ${limit} tracks for ${time_range}`);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockTracks.slice(0, limit);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// React Query hook for mock top genres (aggregated from artists)
export function useTopGenres(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-genres', token, limit, time_range],
    queryFn: async () => {
      console.log(`Mock: Fetching top ${limit} genres for ${time_range}`);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const counts: Record<string, number> = {};
      for (const artist of mockArtists) {
        for (const g of artist.genres || []) {
          counts[g] = (counts[g] || 0) + 1;
        }
      }
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
      return sorted.map(([name, c]) => ({
        name,
        extra: `${c} artist${c > 1 ? "s" : ""}`,
      }));
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// React Query hook for mock cached tracks (used for albums aggregation)
export function useCachedTracks(token: string, limit = 500, time_range = 'long_term') {
  return useQuery({
    queryKey: ['cached-tracks', token, limit, time_range],
    queryFn: async () => {
      console.log(`Mock: Fetching ${limit} cached tracks for ${time_range}`);
      // Simulate longer API delay for large dataset
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Return all mock tracks (simulating large dataset)
      const tracks = [];
      for (let i = 0; i < Math.min(limit, mockTracks.length * 10); i++) {
        tracks.push(mockTracks[i % mockTracks.length]);
      }
      return tracks;
    },
    enabled: !!token,
    staleTime: 60 * 60 * 1000, // 1 hour (longer for large datasets)
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}

// React Query hook for mock top albums (derived from cached tracks)
export function useTopAlbums(token: string, limit = 5, time_range = 'long_term') {
  const tracksQuery = useCachedTracks(token, 500, time_range);
  
  return useQuery({
    queryKey: ['top-albums', token, limit, time_range],
    queryFn: (): Album[] => {
      if (!tracksQuery.data) {
        throw new Error('Tracks data not available');
      }
      
      console.log(`Mock: Generating top ${limit} albums from cached tracks`);
      const tracks = tracksQuery.data;
      
      // Count album occurrences and track album data
      const albumCounts: Record<string, { album: Album; count: number }> = {};
      
      tracks.forEach((track, i) => {
        if (track.album && track.album.id) {
          const albumId = track.album.id;
          
          if (albumCounts[albumId]) {
            albumCounts[albumId].count += (tracks.length - i); // Use reverse index to prioritize earlier albums
          } else {
            albumCounts[albumId] = {
              album: track.album,
              count: tracks.length - i // Use reverse index to prioritize earlier albums
            };
          }
        }
      });
      
      // Sort albums by track count (descending) and return top albums
      const sortedAlbums = Object.values(albumCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(entry => entry.album);
      
      return sortedAlbums;
    },
    enabled: !!token && !!tracksQuery.data && tracksQuery.isSuccess,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}
