/**
 * Minimal Spotify helpers implementing Authorization Code with PKCE
 * - startAuthIfNeeded(): generates PKCE verifier/challenge and redirects to Spotify auth
 * - handleCallback(): exchanges code for tokens and stores them
 * - getTopArtists / getTopTracks / getTopAlbums / getTopGenres
 *
 * NOTE: This is a development starter. For production, implement secure token refresh and storage.
 */

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

export async function getTopArtists(token: string, limit = 5) {
  const data = await fetchSpotify<{ items: any[] }>(token, 'me/top/artists', { limit })
  return data.items.map((a) => ({ name: a.name, extra: a.genres?.slice(0, 2).join(', ') }))
}

export async function getTopTracks(token: string, limit = 5) {
  const data = await fetchSpotify<{ items: any[] }>(token, 'me/top/tracks', { limit })
  return data.items.map((t) => ({ name: `${t.name}`, extra: t.artists?.map((a: any) => a.name).join(', ') }))
}

export async function getTopAlbums(token: string, limit = 5) {
  const data = await fetchSpotify<{ items: any[] }>(token, 'me/top/albums', { limit })
  return data.items.map((al) => ({ name: al.name, extra: al.artists?.map((a: any) => a.name).join(', ') }))
}

/**
 * Aggregate genres from top artists and return top N genres by count
 */
export async function getTopGenres(token: string, limit = 5) {
  const artistsData = await fetchSpotify<{ items: any[] }>(token, 'me/top/artists', { limit: 50 })
  const counts: Record<string, number> = {}
  for (const artist of artistsData.items) {
    for (const g of artist.genres || []) {
      counts[g] = (counts[g] || 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)
  return sorted.map(([name, c]) => ({ name, extra: `${c} artist${c > 1 ? 's' : ''}` }))
}
