import { Close, Play } from "./Icons"

export default function VideoModal({ video, isOpen, onClose }) {
  if (!isOpen) return null;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal__bar">
          <button
            className="modal-close btn btn--icon btn--ghost"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <Close size={18} />
          </button>
        </div>

        <div className="modal-player">
          <iframe
            className="embed"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="modal-body">
          <h2 id="video-modal-title" className="modal-title">{video.title}</h2>
          <div className="modal-meta">
            <span>{video.channel}</span>
            <span className="modal-meta__duration">
              {Math.floor(video.durationSec / 60)}:{String(video.durationSec % 60).padStart(2, "0")}
            </span>
          </div>

          <div className="modal-actions">
            <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <Play size={16} />
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
