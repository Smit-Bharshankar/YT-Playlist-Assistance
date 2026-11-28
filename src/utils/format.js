export function formatTotalDuration(totalSec) {
  const sec = Math.max(0, Math.floor(Number(totalSec) || 0))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatShortDate(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function playlistLabel(playlist) {
  if (playlist?.title) return playlist.title
  const channel = playlist?.items?.[0]?.channel
  return channel ? `${channel} playlist` : "YouTube playlist"
}
