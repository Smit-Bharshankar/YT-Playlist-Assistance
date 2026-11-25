const STORAGE_KEYS = {
  cache: "yt_playlist_cache",
  state: "yt_watch_state",
  settings: "yt_settings",
  sections: "yt_sections"
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

export function getSections(playlistId) {
  const sections = load(STORAGE_KEYS.sections, {})
  return sections[playlistId] || []
}

export function saveSections(playlistId, sections) {
  const all = load(STORAGE_KEYS.sections, {})
  all[playlistId] = sections
  save(STORAGE_KEYS.sections, all)
}

export function exportAll() {
  return {
    cache: load(STORAGE_KEYS.cache, {}),
    state: load(STORAGE_KEYS.state, {}),
    settings: load(STORAGE_KEYS.settings, {}),
    sections: load(STORAGE_KEYS.sections, {})
  }
}

export function importAll(json) {
  try {
    const data = JSON.parse(json)
    if (data.cache) save(STORAGE_KEYS.cache, data.cache)
    if (data.state) save(STORAGE_KEYS.state, data.state)
    if (data.settings) save(STORAGE_KEYS.settings, data.settings)
    if (data.sections) save(STORAGE_KEYS.sections, data.sections)
    return true
  } catch {
    return false
  }
}
