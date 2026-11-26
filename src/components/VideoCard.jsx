export default function VideoCard({ video, state, onToggle, onSaveNote, index, isNextUp, day, isExpanded, onToggleExpand, onOpenModal }) {
  const cur = state[video.videoId] || {}
  const minutes = Math.floor(video.durationSec / 60)
  const secs = video.durationSec % 60

  const stop = (e) => e.stopPropagation()

  return (
    <div
      className={`video-card ${cur.watched ? "watched" : ""} ${isNextUp ? "next-up" : ""} ${isExpanded ? "expanded" : ""}`}
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpenModal()}
    >
      <div className="rank">#{index}</div>
      <img className="thumb" src={video.thumbnail} alt="" loading="lazy" />
      <div className="info">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div className={`title ${cur.watched ? "done" : ""}`}>{video.title}</div>
          {day && <span className="day-badge">Day {day}</span>}
        </div>
        <div className="meta">
          <span>{video.channel}</span>
          <span>•</span>
          <span className="duration-chip">{minutes}:{secs.toString().padStart(2, "0")}</span>
        </div>
        <div className="card-actions">
          <label className="watch" onClick={stop}>
            <div className={`custom-checkbox ${cur.watched ? "checked watched" : ""}`} onClick={stop}>
              <input
                type="checkbox"
                checked={!!cur.watched}
                onChange={e => {
                  e.stopPropagation()
                  onToggle(video.videoId)
                }}
              />
              <div className="checkmark"></div>
            </div>
          </label>
          <button className="btn-notes" title="Add notes" aria-label="Add notes" onClick={e => {
            e.stopPropagation()
            onToggleExpand()
          }}>
            📝
          </button>
        </div>
      </div>
      {isExpanded && (
        <textarea
          className="note-box"
          value={cur.notes || ""}
          placeholder="Add notes…"
          onClick={stop}
          onChange={e => {
            e.stopPropagation()
            saveNote(video.videoId, e.target.value)
          }}
        />
      )}
    </div>
  );
}
