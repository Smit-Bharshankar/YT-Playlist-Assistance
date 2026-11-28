const BASE = "/api/playlist"

export function extractPlaylistId(url) {
  const m = url.match(/[?&]list=([^&]+)/)
  return m ? m[1] : null
}

async function fetchOnePage(playlistId, pageToken = "") {
  const url = `${BASE}?playlistId=${playlistId}${pageToken ? `&pageToken=${pageToken}` : ""}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "YouTube API error")
  }
  return res.json()
}

export async function fetchPlaylist(playlistId) {
  let allItems = []
  let pageToken = ""
  let title = ""

  while (true) {
    const data = await fetchOnePage(playlistId, pageToken)
    if (!title && data.title) title = data.title
    allItems.push(...data.items)

    if (!data.nextPageToken) break
    pageToken = data.nextPageToken
  }

  return {
    playlistId,
    title,
    items: allItems,
    totalVideos: allItems.length,
    totalDurationSec: allItems.reduce((a, b) => a + b.durationSec, 0),
    fetchedAt: Date.now()
  }
}
