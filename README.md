# Spotify Warped

Spotify Warped is a React + TypeScript single-page app that uses the Spotify Web API (Authorization Code with PKCE) to retrieve and display a user's top 5 genres, artists, albums, and tracks.

This repository is a starter scaffold built with Vite.

Features
- React + TypeScript
- Vite for fast dev server & build
- Spotify Authorization Code (PKCE) flow for client-only auth
- Fetches top 5 artists, albums, tracks and aggregates top 5 genres from top artists

Quickstart
1. Register an application at https://developer.spotify.com/dashboard and add a Redirect URI (e.g. http://localhost:5173/callback).
2. Copy `.env.example` to `.env` and set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_REDIRECT_URI.
3. Install dependencies:
   - npm: `npm install`
   - yarn: `yarn`
4. Start dev server:
   - npm: `npm run dev`
   - yarn: `yarn dev`
5. Open the app and sign in with Spotify when prompted.

Notes about tokens and security
- This app uses the Authorization Code with PKCE flow so it can run as a client-only app without a client secret.
- The access token is persisted in memory/localStorage for convenience during development. For production consider a dedicated backend or more secure token handling and refresh logic.

License
- Add a license file if needed (MIT recommended).
