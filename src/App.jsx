import { useState } from "react"
import { usePlaylist } from "./hooks/usePlaylist"
import VideoCard from "./components/VideoCard"
import WatchPlanner from "./components/WatchPlanner"
import VideoModal from "./components/VideoModal"

export default function App() {
  const [url, setUrl] = useState("")
  const [modalVideo, setModalVideo] = useState(null)
  const {
    playlist, state, settings,
    loading, error,
    loadPlaylist, toggleWatch, saveNote, updateSettings
  } = usePlaylist()

  const handleImport = () => loadPlaylist(url)

  const unwatchedFirst = playlist?.items.filter(v => !state[v.videoId] || !state[v.videoId].watched) || []
  const nextUp = unwatchedFirst[0]

  const openModal = (video) => setModalVideo(video)
  const closeModal = () => setModalVideo(null)

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <div className="app-icon">🎬</div>
          <h1>Playlist Tracker</h1>
        </div>
        <p className="subtitle">Videos stay in playlist order. Click any card to play. First unwatched video is highlighted.</p>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Paste YouTube playlist URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button onClick={handleImport} disabled={loading || !url}>
            {loading ? "Importing…" : "Import"}
          </button>
          {error && <span className="error">{error}</span>}
        </div>
        <p className="hint">All data saves to your browser — no account needed.</p>
      </header>

      {playlist ? (
        <div className="content">
          <aside className="sidebar">
            <h3>Playlist</h3>
            <p className="playlist-summary">
              {playlist.totalVideos} videos • {Math.floor(playlist.totalDurationSec / 60)} min total
            </p>
            <WatchPlanner
              playlist={playlist}
              state={state}
              settings={settings}
              updateSettings={updateSettings}
            />
          </aside>

          <main className="video-list">
            {playlist.items.map((video, i) => {
              const isNextUp = nextUp && video.videoId === nextUp.videoId
              return (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  state={state}
                  onToggle={toggleWatch}
                  onSaveNote={saveNote}
                  index={i + 1}
                  isNextUp={isNextUp}
                  onOpenModal={() => openModal(video)}
                />
              )
            })}
          </main>
        </div>
      ) : (
        <div className="empty">
          <p>Paste a YouTube playlist URL to begin.</p>
          <p>All data saves to your browser — no account needed.</p>
        </div>
      )}

      <VideoModal video={modalVideo} isOpen={!!modalVideo} onClose={closeModal} />
    </div>
  );
}
