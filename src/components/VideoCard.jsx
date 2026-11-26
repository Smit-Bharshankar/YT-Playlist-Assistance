export default function VideoCard({ video, state, onToggle, onSaveNote, index, isNextUp, onOpenModal }) {
  const cur = state[video.videoId] || {};
  const minutes = Math.floor(video.durationSec / 60);
  const secs = video.durationSec % 60;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className={`video-card ${cur.watched ? "watched" : ""} ${isNextUp ? "next-up" : ""}`}
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpenModal()}
    >
      <div className="rank">#{index}</div>
      <img className="thumb" src={video.thumbnail} alt="" loading="lazy" />
      <div className="info">
        <div className={`title ${cur.watched ? "done" : ""}`}>{video.title}</div>
        <div className="meta">
          <span>{video.channel}</span>
          <span>•</span>
          <span className="duration-chip">{minutes}:{secs.toString().padStart(2, "0")}</span>
        </div>
        <div className="card-controls">
          <label className="watch" onClick={stop}>
            <input
              type="checkbox"
              checked={!!cur.watched}
              onChange={e => {
                e.stopPropagation();
                onToggle(video.videoId);
              }}
            />
            {cur.watched ? "Watched" : "Watch"}
          </label>
          <button className="btn-notes" title="Add notes" aria-label="Add notes" onClick={stop}>
            📝
          </button>
        </div>
        <textarea
          className="note"
          value={cur.notes || ""}
          placeholder="Add notes..."
          onClick={stop}
          onChange={e => {
            e.stopPropagation();
            onSaveNote(video.videoId, e.target.value);
          }}
        />
      </div>
    </div>
  );
}
