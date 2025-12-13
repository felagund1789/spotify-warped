/**
 * Mock Spotify API implementation for development and testing
 * Provides the same interface as spotify.ts but with sample data
 */

// Mock data for development/testing
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

// Mock data functions
export async function getTopArtists(
  token?: string | null,
  limit = 5,
  time_range = "long_term"
): Promise<Artist[]> {
  // Add small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockArtists.slice(0, limit);
}

export async function getTopTracks(
  token?: string | null,
  limit = 5,
  time_range = "long_term"
) {
  // Add small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockTracks.slice(0, limit);
}

/**
 * Aggregate genres from top artists and return top N genres by count
 */
export async function getTopGenres(
  token?: string | null,
  limit = 5,
  time_range = "long_term"
) {
  // Add small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));

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
}

/**
 * Get top albums by aggregating album data from mock tracks
 * Returns the most frequent albums based on track count
 */
export async function getTopAlbums(
  token?: string | null,
  limit = 5,
  time_range = "long_term"
): Promise<Album[]> {
  // Add small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  // Count album occurrences and track album data
  const albumCounts: Record<string, { album: Album; count: number }> = {};
  
  mockTracks.forEach((track, i) => {
    if (track.album && track.album.id) {
      const albumId = track.album.id;
      
      if (albumCounts[albumId]) {
        albumCounts[albumId].count += (mockTracks.length - i); // Use reverse index to prioritize earlier albums
      } else {
        albumCounts[albumId] = {
          album: track.album,
          count: mockTracks.length - i // Use reverse index to prioritize earlier albums
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
}
