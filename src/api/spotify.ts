/**
 * Spotify API helpers with React Query caching
 * - Uses React Query for all data fetching and caching
 * - Query keys follow the pattern [endpoint, token, limit, time_range]
 */

import { useQuery } from '@tanstack/react-query'
import { Artist, Track, Album } from "../types"

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = (import.meta.env.VITE_SPOTIFY_SCOPES || 'user-top-read').split(' ')

const STORAGE = {
  accessTokenKey: 'sw_access_token',
  expiresAtKey: 'sw_expires_at',
  pkceVerifierKey: 'sw_pkce_verifier'
}

function base64URLEncode(str: ArrayBuffer) {
  const bytes = new Uint8Array(str)
  let s = ''
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256(plain: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return await crypto.subtle.digest('SHA-256', data)
}

function generateRandomString(length = 128) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array).map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('')
}

export async function startAuthIfNeeded() {
  const verifier = generateRandomString(64)
  const verifierStr = verifier
  sessionStorage.setItem(STORAGE.pkceVerifierKey, verifierStr)
  const hashed = await sha256(verifierStr)
  const challenge = base64URLEncode(hashed)
  const state = Math.random().toString(36).substring(2, 15)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES.join(' '),
    state
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code) return
  const verifier = sessionStorage.getItem(STORAGE.pkceVerifierKey)
  if (!verifier) throw new Error('Missing PKCE verifier')

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  })

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  if (!r.ok) {
    const text = await r.text()
    throw new Error('Token exchange failed: ' + text)
  }

  const data = await r.json()
  const accessToken = data.access_token as string
  const expiresIn = data.expires_in as number
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(STORAGE.accessTokenKey, accessToken)
  localStorage.setItem(STORAGE.expiresAtKey, String(expiresAt))
  // remove verifier
  sessionStorage.removeItem(STORAGE.pkceVerifierKey)
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(STORAGE.accessTokenKey)
  const expiresAtStr = localStorage.getItem(STORAGE.expiresAtKey)
  if (!token || !expiresAtStr) return null
  const expiresAt = Number(expiresAtStr)
  if (Date.now() > expiresAt) {
    // expired — clear
    localStorage.removeItem(STORAGE.accessTokenKey)
    localStorage.removeItem(STORAGE.expiresAtKey)
    return null
  }
  return token
}

export function logout() {
  localStorage.removeItem(STORAGE.accessTokenKey)
  localStorage.removeItem(STORAGE.expiresAtKey)
}

async function fetchSpotify<T>(token: string, path: string, params?: Record<string, string | number>) {
  const url = new URL(`https://api.spotify.com/v1/${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`Spotify API error: ${txt}`)
  }
  return (await r.json()) as T
}

// React Query hook for fetching top artists
export function useTopArtists(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-artists', token, limit, time_range],
    queryFn: async (): Promise<Artist[]> => {
      const data = await fetchSpotify<{ items: Artist[] }>(token, 'me/top/artists', { limit, time_range })
      return data.items
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// React Query hook for fetching top tracks
export function useTopTracks(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-tracks', token, limit, time_range],
    queryFn: async (): Promise<Track[]> => {
      const data = await fetchSpotify<{ items: Track[] }>(token, 'me/top/tracks', { limit, time_range })
      return data.items
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// React Query hook for fetching top genres (aggregated from artists)
export function useTopGenres(token: string, limit = 5, time_range = 'long_term') {
  return useQuery({
    queryKey: ['top-genres', token, limit, time_range],
    queryFn: async () => {
      const artistsData = await fetchSpotify<{ items: Artist[] }>(token, 'me/top/artists', { limit: 50, time_range })
      const counts: Record<string, number> = {}
      for (const artist of artistsData.items) {
        for (const g of artist.genres || []) {
          counts[g] = (counts[g] || 0) + 1
        }
      }
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)
      return sorted.map(([name, c]) => ({ name, extra: `${c} artist${c > 1 ? 's' : ''}` }))
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// React Query hook for fetching large number of tracks (used for albums aggregation)
export function useCachedTracks(token: string, limit = 500, time_range = 'long_term') {
  return useQuery({
    queryKey: ['cached-tracks', token, limit, time_range],
    queryFn: async (): Promise<Track[]> => {
      const allTracks: Track[] = []
      
      console.log(`Fetching top ${limit} tracks from Spotify API...`)
      
      // Fetch pages of 50 tracks each
      for (let page = 0; page < Math.ceil(limit / 50); page++) {
        const offset = page * 50
        console.log(`Fetching tracks ${offset + 1}-${Math.min(offset + 50, limit)}...`)
        
        const data = await fetchSpotify<{ items: Track[] }>(token, 'me/top/tracks', { 
          limit: Math.min(50, limit - offset), 
          offset, 
          time_range 
        })
        
        allTracks.push(...data.items)
        
        // If we get fewer tracks than requested, we've reached the end
        if (data.items.length < Math.min(50, limit - offset)) {
          console.log(`Reached end of tracks at ${allTracks.length} total tracks`)
          break
        }
        
        // If we've fetched the requested limit, stop
        if (allTracks.length >= limit) {
          break
        }
        
        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`Successfully fetched ${allTracks.length} top tracks`)
      return allTracks
    },
    enabled: !!token,
    staleTime: 60 * 60 * 1000, // 1 hour (longer for large datasets)
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  })
}

// React Query hook for top albums (derived from cached tracks)
export function useTopAlbums(token: string, limit = 5, time_range = 'long_term') {
  const tracksQuery = useCachedTracks(token, 500, time_range)
  
  return useQuery({
    queryKey: ['top-albums', token, limit, time_range],
    queryFn: (): Album[] => {
      if (!tracksQuery.data) {
        throw new Error('Tracks data not available')
      }
      
      const tracks = tracksQuery.data
      
      // Count album occurrences and track album data
      const albumCounts: Record<string, { album: Album; count: number }> = {}
      
      tracks.forEach((track, i) => {
        if (track.album && track.album.id) {
          const albumId = track.album.id
          
          if (albumCounts[albumId]) {
            albumCounts[albumId].count += (tracks.length - i) // Use reverse index to prioritize earlier albums
          } else {
            albumCounts[albumId] = {
              album: track.album,
              count: tracks.length - i // Use reverse index to prioritize earlier albums
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
    },
    enabled: !!token && !!tracksQuery.data && tracksQuery.isSuccess,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  })
}
