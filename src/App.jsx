import { useState, useMemo } from "react"
import { usePlaylist } from "./hooks/usePlaylist"
import { useBudgetDraft } from "./hooks/useBudgetDraft"
import VideoCard from "./components/VideoCard"
import WatchPlanner from "./components/WatchPlanner"
import VideoModal from "./components/VideoModal"
import {
  LinkIcon, Search, Download, Upload, ChevronDown, Alert
} from "./components/Icons"

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

  const dailyGoal = useBudgetDraft(
    settings.dailyBudgetMinutes,
    settings.weekendBudgetMinutes,
    (minutes) => updateSettings({ dailyBudgetMinutes: minutes })
  )

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

  // Assign day numbers from the daily budget, falling back to the weekend budget when daily is 0
  const planMinutes = settings.dailyBudgetMinutes > 0 ? settings.dailyBudgetMinutes : settings.weekendBudgetMinutes
  const dailySec = planMinutes * 60
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
        <div className="top-bar__inner">
          <div className="app-header">
            <span className="app-mark">
              <img src="/logo.svg" alt="" width="36" height="36" />
            </span>
            <div className="app-header__text">
              <h1>Playlist Tracker</h1>
              <p className="subtitle">Watch, track, take notes</p>
            </div>
          </div>

          <div className="top-bar__actions">
            <button onClick={handleExport} className="btn btn--ghost" type="button">
              <Download size={16} />
              Backup
            </button>
            <button
              onClick={() => {
                const input = document.querySelector('input[type="file"][accept=".json"]')
                if (input) input.click()
              }}
              className="btn btn--ghost"
              type="button"
            >
              <Upload size={16} />
              Restore
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="visually-hidden"
              ref={null}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="controls-row">
          <div className="field field--icon">
            <LinkIcon size={18} className="field__icon" />
            <input
              type="text"
              placeholder="Paste YouTube playlist URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              aria-label="YouTube playlist URL"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={loading || !url}
            className="btn btn--primary"
            type="button"
          >
            {loading ? "Importing…" : "Import"}
          </button>
          {error && (
            <span className="error" role="alert">
              <Alert size={14} />
              {error}
            </span>
          )}
        </div>

        <div className="goal-row">
          <button
            className="disclosure"
            onClick={() => setShowGoal(!showGoal)}
            aria-expanded={showGoal}
            type="button"
          >
            <ChevronDown
              size={14}
              className={`disclosure__chevron ${showGoal ? "is-open" : ""}`}
            />
            Daily goal
            {!showGoal && (
              <span className="goal-summary">{settings.dailyBudgetMinutes} min / day</span>
            )}
          </button>
          {showGoal && (
            <div className="goal-field-group">
              <label className="goal-fields" htmlFor="daily-goal">
                <span>Watch</span>
                <input
                  ref={dailyGoal.inputRef}
                  id="daily-goal"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={dailyGoal.draft}
                  onChange={dailyGoal.handleChange}
                  onBlur={dailyGoal.handleBlur}
                  onFocus={dailyGoal.handleFocus}
                  aria-invalid={dailyGoal.error ? true : undefined}
                  aria-describedby={dailyGoal.error ? "daily-goal-error" : undefined}
                />
                <span>min / day</span>
              </label>
              {dailyGoal.error && (
                <span className="budget-error" id="daily-goal-error" role="alert">
                  {dailyGoal.error}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {playlist ? (
        <div className="content">
          <main className="main-panel">
            <div className="filter-bar">
              <div className="field field--icon filter-bar__search">
                <Search size={18} className="field__icon" />
                <input
                  type="text"
                  placeholder="Search videos or channel…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search videos or channel"
                />
              </div>
              <div className="segmented" role="group" aria-label="Filter videos">
                <button
                  className={`filter-chip ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                  aria-pressed={filter === "all"}
                  type="button"
                >
                  All
                </button>
                <button
                  className={`filter-chip ${filter === "watched" ? "active" : ""}`}
                  onClick={() => setFilter("watched")}
                  aria-pressed={filter === "watched"}
                  type="button"
                >
                  Watched
                </button>
                <button
                  className={`filter-chip ${filter === "unwatched" ? "active" : ""}`}
                  onClick={() => setFilter("unwatched")}
                  aria-pressed={filter === "unwatched"}
                  type="button"
                >
                  Unwatched
                </button>
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="empty empty--filter" role="status">
                <p>No videos match your filter.</p>
              </div>
            ) : (
              <div className="ledger">
                <div className="ledger__head" aria-hidden="true">
                  <span>No.</span>
                  <span />
                  <span>Video</span>
                  <span className="ledger__head-duration">Length</span>
                  <span className="ledger__head-status">Watched</span>
                </div>
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
      ) : loading ? (
        <div className="loading-state" role="status" aria-busy="true">
          <span className="visually-hidden">Importing playlist</span>
          <div className="skeleton-list" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="skeleton-row" key={i}>
                <span className="skeleton skeleton--rank" />
                <span className="skeleton skeleton--thumb" />
                <span className="skeleton-block">
                  <span className="skeleton skeleton--title" />
                  <span className="skeleton skeleton--meta" />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty empty--start">
          <img className="empty__logo" src="/logo.svg" alt="" width="48" height="48" />
          <p>Paste a YouTube playlist URL to begin.</p>
          <p>Videos stay in playlist order. Click any video to play and take notes.</p>
        </div>
      )}

      <footer className="app-footer">
        <span className="app-footer__brand">
          <img src="/logo.svg" alt="" width="20" height="20" />
          Playlist Tracker
        </span>
        <span className="app-footer__note">Progress and notes stay in this browser.</span>
      </footer>

      <VideoModal video={modalVideo} isOpen={!!modalVideo} onClose={closeModal} />
    </div>
  );
}
