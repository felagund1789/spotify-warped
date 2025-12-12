import React, { useEffect, useState } from 'react'
import { startAuthIfNeeded, handleCallback, getAccessToken, logout } from './api/spotify'
import TopLists from './components/TopLists'

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
      {!token ? (
        <div className="auth-section">
          <h1>Spotify Warped</h1>
          <p>Sign in with Spotify to see your top 5 genres, artists, albums, and tracks.</p>
          <button onClick={() => startAuthIfNeeded()}>Sign in with Spotify</button>
        </div>
      ) : (
        <div className="app-content">
          <button className="logout-btn" onClick={() => { logout(); setToken(null); }}>Sign out</button>
          <TopLists token={token} />
        </div>
      )}
    </div>
  )
}
