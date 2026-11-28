const STORAGE_KEYS = {
  cache: "yt_playlist_cache",
  playlistStates: "yt_playlist_state",
  activePlaylist: "yt_active_playlist",
  settings: "yt_settings"
}

const LEGACY_STATE_KEY = "yt_watch_state"

export function load(key, def) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : def
  } catch {
    return def
  }
}

export function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

export function getCache(playlistId) {
  const cache = load(STORAGE_KEYS.cache, {})
  return cache[playlistId] || null
}

export function getCacheAll() {
  return load(STORAGE_KEYS.cache, {})
}

export function setCache(playlistId, data) {
  const cache = load(STORAGE_KEYS.cache, {})
  cache[playlistId] = data
  save(STORAGE_KEYS.cache, cache)
}

export function removeCache(playlistId) {
  const cache = load(STORAGE_KEYS.cache, {})
  delete cache[playlistId]
  save(STORAGE_KEYS.cache, cache)
}

export function getAllPlaylistStates() {
  return load(STORAGE_KEYS.playlistStates, {})
}

export function getPlaylistState(playlistId) {
  return getAllPlaylistStates()[playlistId] || {}
}

export function savePlaylistState(playlistId, state) {
  const all = getAllPlaylistStates()
  all[playlistId] = state
  save(STORAGE_KEYS.playlistStates, all)
}

export function removePlaylistState(playlistId) {
  const all = getAllPlaylistStates()
  delete all[playlistId]
  save(STORAGE_KEYS.playlistStates, all)
}

export function getActivePlaylistId() {
  return localStorage.getItem(STORAGE_KEYS.activePlaylist)
}

export function saveActivePlaylistId(playlistId) {
  if (playlistId) localStorage.setItem(STORAGE_KEYS.activePlaylist, playlistId)
  else localStorage.removeItem(STORAGE_KEYS.activePlaylist)
}

export function clearActivePlaylistId() {
  localStorage.removeItem(STORAGE_KEYS.activePlaylist)
}

export function migrateLegacyState(playlistId) {
  if (!playlistId) return
  const legacy = load(LEGACY_STATE_KEY, null)
  if (!legacy || typeof legacy !== "object" || !Object.keys(legacy).length) return

  const all = getAllPlaylistStates()
  if (!all[playlistId]) {
    all[playlistId] = legacy
    save(STORAGE_KEYS.playlistStates, all)
  }
  localStorage.removeItem(LEGACY_STATE_KEY)
}

export function getSettings() {
  return load(STORAGE_KEYS.settings, {
    dailyBudgetMinutes: 30,
    weekendBudgetMinutes: 60,
    lockSequential: false
  })
}

export function saveSettings(s) {
  save(STORAGE_KEYS.settings, s)
}

export function exportData() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    activePlaylistId: getActivePlaylistId(),
    cache: getCacheAll(),
    states: getAllPlaylistStates(),
    settings: getSettings()
  }
}

export function importData(data) {
  try {
    if (!data || typeof data !== "object") return false

    if (
      data.version === 2 &&
      data.cache && typeof data.cache === "object" &&
      data.states && typeof data.states === "object"
    ) {
      save(STORAGE_KEYS.cache, data.cache)
      save(STORAGE_KEYS.playlistStates, data.states)
      if (data.settings) saveSettings(data.settings)
      if (data.activePlaylistId) saveActivePlaylistId(data.activePlaylistId)
      else clearActivePlaylistId()
      localStorage.removeItem(LEGACY_STATE_KEY)
      return true
    }

    // Legacy single-playlist backup: { state, settings, notes }
    if (data.state && typeof data.state === "object") {
      if (data.settings) saveSettings(data.settings)
      const active = getActivePlaylistId()
      const cache = getCacheAll()
      const target = active && cache[active] ? active : Object.keys(cache)[0]
      if (target) {
        savePlaylistState(target, data.state)
        saveActivePlaylistId(target)
      } else {
        save(LEGACY_STATE_KEY, data.state)
      }
      return true
    }

    return false
  } catch {
    return false
  }
}
