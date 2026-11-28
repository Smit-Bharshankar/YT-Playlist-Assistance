import { useState, useCallback, useMemo } from "react"
import { fetchPlaylist, extractPlaylistId } from "../services/youtube"
import {
  getCache, getCacheAll, setCache, removeCache,
  getPlaylistState, getAllPlaylistStates, savePlaylistState, removePlaylistState,
  getActivePlaylistId, saveActivePlaylistId, clearActivePlaylistId,
  migrateLegacyState, getSettings, saveSettings
} from "../utils/storage"

const STALE_MS = 24 * 60 * 60 * 1000

function buildLibrary(activeId) {
  const cache = getCacheAll()
  const states = getAllPlaylistStates()

  return Object.entries(cache)
    .filter(([, playlist]) => playlist && Array.isArray(playlist.items))
    .map(([cacheId, playlist]) => {
      const playlistId = playlist.playlistId || cacheId
      const playlistState = states[cacheId] || states[playlistId] || {}
      return {
        ...playlist,
        playlistId,
        watchedCount: playlist.items.filter(v => playlistState[v.videoId]?.watched).length,
        totalCount: playlist.items.length,
        active: playlistId === activeId
      }
    })
    .sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1
      return (b.fetchedAt || 0) - (a.fetchedAt || 0)
    })
}

function readInitial() {
  const cache = getCacheAll()
  const ids = Object.keys(cache).filter(id => cache[id]?.items)
  let activeId = getActivePlaylistId()

  if (!activeId || !cache[activeId]?.items) {
    activeId = ids.sort((a, b) => (cache[b].fetchedAt || 0) - (cache[a].fetchedAt || 0))[0] || null
    if (activeId) saveActivePlaylistId(activeId)
  }

  if (activeId) migrateLegacyState(activeId)

  return {
    activeId,
    playlist: activeId ? cache[activeId] : null,
    state: activeId ? getPlaylistState(activeId) : {}
  }
}

export function usePlaylist() {
  const [initial] = useState(readInitial)
  const [playlist, setPlaylist] = useState(initial.playlist)
  const [activePlaylistId, setActivePlaylistId] = useState(initial.activeId)
  const [state, setState] = useState(initial.state)
  const [settings, setSettings] = useState(getSettings())
  const [libraryVersion, setLibraryVersion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const library = useMemo(
    () => buildLibrary(activePlaylistId),
    [activePlaylistId, libraryVersion]
  )

  const loadPlaylist = useCallback(async (url) => {
    const id = extractPlaylistId(url)
    if (!id) { setError("No playlist ID found"); return }

    setLoading(true)
    setError("")

    const cached = getCache(id)
    const now = Date.now()

    const apply = (data) => {
      setCache(id, data)
      migrateLegacyState(id)
      setActivePlaylistId(id)
      saveActivePlaylistId(id)
      setPlaylist(data)
      setState(getPlaylistState(id))
      setLibraryVersion(v => v + 1)
    }

    try {
      if (cached && cached.title && now - cached.fetchedAt < STALE_MS) {
        apply(cached)
      } else {
        const data = await fetchPlaylist(id)
        apply(data)
      }
    } catch (e) {
      setError(e.message)
      if (cached) apply(cached)
    }

    setLoading(false)
  }, [])

  const openPlaylist = useCallback((id) => {
    const cached = getCache(id)
    if (!cached) return

    migrateLegacyState(id)
    setActivePlaylistId(id)
    saveActivePlaylistId(id)
    setPlaylist(cached)
    setState(getPlaylistState(id))
    setLibraryVersion(v => v + 1)
  }, [])

  const removePlaylist = useCallback((id) => {
    removeCache(id)
    removePlaylistState(id)

    if (id === activePlaylistId) {
      setActivePlaylistId(null)
      clearActivePlaylistId()
      setPlaylist(null)
      setState({})
    }

    setLibraryVersion(v => v + 1)
  }, [activePlaylistId])

  const toggleWatch = useCallback((videoId) => {
    if (!activePlaylistId) return

    setState(prev => {
      const next = { ...prev }
      const cur = next[videoId] || { watched: false }
      next[videoId] = {
        ...cur,
        watched: !cur.watched,
        watchedAt: cur.watched ? null : new Date().toISOString()
      }
      savePlaylistState(activePlaylistId, next)
      return next
    })
    setLibraryVersion(v => v + 1)
  }, [activePlaylistId])

  const saveNote = useCallback((videoId, note) => {
    if (!activePlaylistId) return

    setState(prev => {
      const next = { ...prev }
      next[videoId] = { ...(next[videoId] || {}), notes: note }
      savePlaylistState(activePlaylistId, next)
      return next
    })
  }, [activePlaylistId])

  const updateSettings = useCallback((updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    saveSettings(next)
  }, [settings])

  return {
    playlist, library, activePlaylistId,
    state, settings,
    loading, error,
    loadPlaylist, openPlaylist, removePlaylist,
    toggleWatch, saveNote, updateSettings
  }
}
