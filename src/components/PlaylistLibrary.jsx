import { Trash } from "./Icons"
import { formatTotalDuration, formatShortDate, playlistLabel } from "../utils/format"

export default function PlaylistLibrary({ playlists, activePlaylistId, onOpen, onRemove }) {
  if (!playlists.length) {
    return (
      <main className="library-view">
        <div className="empty empty--start">
          <img className="empty__logo" src="/logo.svg" alt="" width="48" height="48" />
          <p>Paste a YouTube playlist URL to begin.</p>
          <p>Each saved playlist keeps its own watch state, notes, and plan.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="library-view">
      <div className="library-head">
        <h2 className="library-title">Saved playlists</h2>
        <span className="library-count">
          {playlists.length} playlist{playlists.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="library-list">
        {playlists.map((playlist) => {
          const active = playlist.playlistId === activePlaylistId
          const pct = playlist.totalCount > 0
            ? Math.round((playlist.watchedCount / playlist.totalCount) * 100)
            : 0
          const updated = formatShortDate(playlist.fetchedAt)

          return (
            <div
              key={playlist.playlistId}
              className={`library-row ${active ? "is-active" : ""}`}
            >
              <button
                className="library-row__open"
                onClick={() => onOpen(playlist.playlistId)}
                type="button"
              >
                <span className="library-row__title">{playlistLabel(playlist)}</span>
                <span className="library-row__meta">
                  <span>{playlist.totalCount} videos</span>
                  <span className="library-row__duration">
                    {formatTotalDuration(playlist.totalDurationSec)}
                  </span>
                  {active && <span className="next-tag">Current</span>}
                </span>
              </button>

              <div className="library-row__progress">
                <span className="library-row__count">
                  {playlist.watchedCount} / {playlist.totalCount} watched
                </span>
                <span className="library-row__meter" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
              </div>

              <span className="library-row__date">
                {updated ? `Updated ${updated}` : ""}
              </span>

              <button
                className="btn-notes library-row__remove"
                onClick={() => onRemove(playlist.playlistId)}
                aria-label={`Remove ${playlistLabel(playlist)}`}
                title="Remove playlist"
                type="button"
              >
                <Trash size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
