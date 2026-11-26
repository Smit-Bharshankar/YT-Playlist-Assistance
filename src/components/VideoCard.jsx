import { Note } from "./Icons"

export default function VideoCard({ video, state, onToggle, onSaveNote, index, isNextUp, day, isExpanded, onToggleExpand, onOpenModal }) {
  const cur = state[video.videoId] || {}
  const minutes = Math.floor(video.durationSec / 60)
  const secs = video.durationSec % 60
  const duration = `${minutes}:${secs.toString().padStart(2, "0")}`

  const stop = (e) => e.stopPropagation()

  return (
    <div
      className={`video-row ${cur.watched ? "watched" : ""} ${isNextUp ? "next-up" : ""} ${isExpanded ? "expanded" : ""}`}
      data-day={day || undefined}
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpenModal()}
    >
      <div className="rank">#{index}</div>

      <div className="thumb-wrap">
        <img
          className="thumb"
          src={video.thumbnail}
          alt=""
          loading={index === 1 ? "eager" : "lazy"}
          fetchpriority={index === 1 ? "high" : "auto"}
          decoding="async"
          width="160"
          height="90"
        />
      </div>

      <div className="info">
        <div className="title-row">
          <div className={`title ${cur.watched ? "done" : ""}`}>{video.title}</div>
        </div>
        <div className="meta">
          <span className="channel">{video.channel}</span>
          <span className="meta-duration">{duration}</span>
          {isNextUp && <span className="next-tag">Up next</span>}
        </div>
      </div>

      <div className="duration">{duration}</div>

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
              aria-label={cur.watched ? `Mark ${video.title} unwatched` : `Mark ${video.title} watched`}
            />
            <div className="checkmark"></div>
          </div>
        </label>
        <button
          className="btn-notes"
          title="Add notes"
          aria-label="Add notes"
          aria-expanded={isExpanded}
          onClick={e => {
            e.stopPropagation()
            onToggleExpand()
          }}
          type="button"
        >
          <Note size={16} />
        </button>
      </div>

      {isExpanded && (
        <textarea
          className="note-box"
          value={cur.notes || ""}
          placeholder="Add notes…"
          aria-label={`Notes for ${video.title}`}
          onClick={stop}
          onChange={e => {
            e.stopPropagation()
            onSaveNote(video.videoId, e.target.value)
          }}
        />
      )}
    </div>
  );
}
