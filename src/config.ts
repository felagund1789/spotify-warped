export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
export const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
export const SCOPES = (import.meta.env.VITE_SPOTIFY_SCOPES || 'user-top-read').split(' ')
export const DEMO_MODE = import.meta.env.VITE_PUBLIC_DEMO_MODE === "true";
