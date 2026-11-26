import { useState, useCallback, useMemo } from "react"
import { usePlaylist } from "./hooks/usePlaylist"
import VideoCard from "./components/VideoCard"
import WatchPlanner from "./components/WatchPlanner"
import VideoModal from "./components/VideoModal"

export default function App() {
  const [url, setUrl] = useState("")
  const [modalVideo, setModalVideo] = useState(null)
  const [filter, setFilter] = useState("all") // all | watched | unwatched
  const [search, setSearch] = useState("")
  const [showGoal, setShowGoal] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)

  const {
    playlist, state, settings,
    loading, error,
    loadPlaylist, toggleWatch, saveNote, updateSettings
  } = usePlaylist()

  const handleImport = () => loadPlaylist(url)

  // Filter + search the video list
  const filteredVideos = useMemo(() => {
    if (!playlist) return []
    return playlist.items.filter((v) => {
      const watched = !!state[v.videoId] && !!state[v.videoId].watched
      const matchFilter =
        filter === "all" ||
        (filter === "watched" && watched) ||
        (filter === "unwatched" && !watched)
      const matchSearch =
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [playlist, state, filter, search])

  // Determine next up video (first unwatched in full playlist order)
  const unwatchedFirst = playlist?.items.find(v => !state[v.videoId] || !state[v.videoId].watched) || null

  // Assign day numbers based on daily budget
  const dailySec = settings.dailyBudgetMinutes * 60
  const videoDays = useMemo(() => {
    if (!playlist || dailySec <= 0) return {}
    let day = 1
    let sec = 0
    const map = {}
    for (const v of playlist.items) {
      if (sec + v.durationSec > dailySec && sec > 0) {
        day++
        sec = 0
      }
      map[v.videoId] = day
      sec += v.durationSec
    }
    return map
  }, [playlist, dailySec])

  const openModal = (video) => setModalVideo(video)
  const closeModal = () => setModalVideo(null)

  // Export / Import
  const handleExport = () => {
    const data = {
      state: state,
      settings: settings,
      notes: Object.fromEntries(
        Object.entries(state).map(([id, s]) => [id, s.notes || ""])
      )
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url2 = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url2
    a.download = `playlist-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url2)
  }

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        // Merge imported state with current
        const importedState = data.state || {}
        const importedSettings = data.settings || {}
        // Update localStorage via hook by setting directly
        // We'll dispatch by calling updateSettings and toggling each video
        Object.keys(importedSettings).forEach(k => updateSettings({ [k]: importedSettings[k] }))
        // For videos, we need to set watched state - toggle each to match imported
        // Simpler: just replace state wholesale by toggling differences
        playlist?.items.forEach(v => {
          const imported = importedState[v.videoId]
          const current = state[v.videoId] || { watched: false }
          if (imported && imported.watched !== current.watched) {
            toggleWatch(v.videoId)
          }
          if (imported && imported.notes !== undefined && imported.notes !== (current.notes || "")) {
            saveNote(v.videoId, imported.notes || "")
          }
        })
      } catch (err) {
        alert("Failed to import backup file")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <header className="top-bar">
        <div className="app-header">
          <div className="app-icon">🎬</div>
          <div>
            <h1>Playlist Tracker</h1>
            <span className="subtitle">• Watch, track, take notes</span>
          </div>
        </div>

        <div className="controls-row">
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

        {/* Daily Goal - small, collapsible */}
        <div className="daily-goal">
          <button className="daily-goal-toggle" onClick={() => setShowGoal(!showGoal)}>
            {showGoal ? "▾" : "▸"} Daily goal
          </button>
          {showGoal && (
            <>
              <span style={{ marginRight: 8, color: "var(--color-text-secondary)" }}>Watch</span>
              <input
                type="number"
                value={settings.dailyBudgetMinutes}
                onChange={e => updateSettings({ dailyBudgetMinutes: parseInt(e.target.value) || 30 })}
              />
              <span style={{ marginLeft: 6, color: "var(--color-text-secondary)" }}>min / day</span>
              <button
                onClick={handleExport}
                className="btn-outline"
                style={{ marginLeft: 10, padding: "6px 12px" }}
              >
                💾 Backup
              </button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                style={{ display: "none" }}
                ref={null}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="file"][accept=".json"]')
                  if (input) input.click()
                }}
                className="btn-outline"
                style={{ marginLeft: 6, padding: "6px 12px" }}
              >
                📥 Restore
              </button>
            </>
          )}
        </div>
      </header>

      {playlist ? (
        <div className="content">
          <main className="main-panel">
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search videos or channel…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: "200px" }}
              />
              <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                All
              </button>
              <button className={`filter-chip ${filter === "watched" ? "active" : ""}`} onClick={() => setFilter("watched")}>
                Watched
              </button>
              <button className={`filter-chip ${filter === "unwatched" ? "active" : ""}`} onClick={() => setFilter("unwatched")}>
                Unwatched
              </button>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="empty">
                <p>No videos match your filter.</p>
              </div>
            ) : (
              <div className="video-list">
                {filteredVideos.map((video, i) => {
                  const isNextUp = unwatchedFirst && video.videoId === unwatchedFirst.videoId
                  const isExpanded = expandedCard === video.videoId
                  const day = videoDays[video.videoId]
                  const prevDay = i > 0 ? videoDays[filteredVideos[i - 1].videoId] : null
                  const showDayDivider = day && day !== prevDay
                  return (
                    <div key={video.videoId}>
                      {showDayDivider && <div className="day-divider">Day {day}</div>}
                      <VideoCard
                        video={video}
                        state={state}
                        onToggle={toggleWatch}
                        onSaveNote={saveNote}
                        index={playlist.items.findIndex(v => v.videoId === video.videoId) + 1}
                        isNextUp={isNextUp}
                        day={day}
                        isExpanded={isExpanded}
                        onToggleExpand={() => setExpandedCard(expandedCard === video.videoId ? null : video.videoId)}
                        onOpenModal={() => openModal(video)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </main>

          <aside className="sidebar">
            <WatchPlanner
              playlist={playlist}
              state={state}
              settings={settings}
              updateSettings={updateSettings}
            />
          </aside>
        </div>
      ) : (
        <div className="empty" style={{ padding: "60px 20px" }}>
          <p>Paste a YouTube playlist URL to begin.</p>
          <p>Videos stay in playlist order. Click any card to play and take notes.</p>
        </div>
      )}

      <VideoModal video={modalVideo} isOpen={!!modalVideo} onClose={closeModal} />
    </div>
  );
}
