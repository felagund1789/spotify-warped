import React from 'react'

interface Track {
  name: string
  extra?: string
}

interface TrackListProps {
  tracks: Track[]
}

export default function TrackList({ tracks }: TrackListProps) {
  return (
    <section className="box">
      <h2>Top Tracks</h2>
      <ol>
        {tracks.map((track, i) => (
          <li key={i}>
            <strong>{track.name}</strong>
            {track.extra ? <span className="muted"> — {track.extra}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}