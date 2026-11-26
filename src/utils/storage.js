const STORAGE_KEYS = {
  cache: "yt_playlist_cache",
  state: "yt_watch_state",
  settings: "yt_settings"
}

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

export function setCache(playlistId, data) {
  const cache = load(STORAGE_KEYS.cache, {})
  cache[playlistId] = data
  save(STORAGE_KEYS.cache, cache)
}

export function getState() {
  return load(STORAGE_KEYS.state, {})
}

export function saveState(state) {
  save(STORAGE_KEYS.state, state)
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
