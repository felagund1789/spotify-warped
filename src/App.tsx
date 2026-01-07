import { useEffect, useState } from 'react';
import TopLists from './components/TopLists';
import { DEMO_MODE } from './config';
import { MusicProvider } from './providers/MusicProvider';
import { getAccessToken, handleCallback, logout, startAuthIfNeeded } from './services/SpotifyService';

export default function App() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // If the URL contains the Spotify callback code, handle it
    if (window.location.search.includes('code=')) {
      handleCallback().then(() => {
        const t = getAccessToken()
        setToken(t)
        // clean up URL
        window.history.replaceState({}, document.title, '/')
      })
      return
    }

    const t = getAccessToken()
    if (!t) {
      // no token: show sign in button
      return
    }
    setToken(t)
  }, [])

  return (
    <div className="container">
      {!DEMO_MODE && !token ? (
        <div className="auth-section">
          <h1>Spotify Warped</h1>
          <p>Sign in with Spotify to see your top 5 genres, artists, albums, and tracks.</p>
          <button onClick={() => startAuthIfNeeded()}>Sign in with Spotify</button>
        </div>
      ) : (
        <MusicProvider useMockService={ DEMO_MODE}>
          <div className="app-content">
            <button className="logout-btn" onClick={logout}>Sign out</button>
            <TopLists />
          </div>
        </MusicProvider>
      )}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="disclaimer">
            This is an unofficial application and is not affiliated with, endorsed by, or sponsored by Spotify AB.
          </p>
          <p className="disclaimer">
            "Spotify" and "Spotify Wrapped" are trademarks of Spotify AB. This app uses the Spotify Web API to display your personal music data.
          </p>
            <p className="footer-links">
            <a href="https://www.spotify.com" target="_blank" rel="noopener noreferrer">Spotify.com</a>
            <span className="separator">•</span>
            <a href="https://developer.spotify.com/documentation/web-api" target="_blank" rel="noopener noreferrer">Spotify Web API</a>
            <span className="separator">•</span>
              <a href="https://github.com/felagund1789/spotify-warped" target="_blank" rel="noopener noreferrer">
                Spotify Warped on <img src="/github-icon.svg" alt="GitHub" className="github-icon" />
              </a>
            </p>
        </div>
      </footer>
    </div>
  )
}
