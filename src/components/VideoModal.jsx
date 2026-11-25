export default function VideoModal({ video, isOpen, onClose }) {
  if (!isOpen) return null;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const youtubeShortsUrl = `https://www.youtube.com/shorts/${video.videoId}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-header">
          <h2 className="modal-title">{video.title}</h2>
          <div className="modal-meta">
            <span>{video.channel}</span>
            <span>•</span>
            <span>{Math.floor(video.durationSec / 60)}:{String(video.durationSec % 60).padStart(2, "0")}</span>
          </div>
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

        <div className="modal-actions">
          <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            📺 Watch on YouTube
          </a>
          <a href={youtubeShortsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            ⚡ YouTube Shorts
          </a>
        </div>
      </div>
    </div>
  );
}
