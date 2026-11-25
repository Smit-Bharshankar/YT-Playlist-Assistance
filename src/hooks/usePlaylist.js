import { useState, useEffect, useCallback } from "react"
import { fetchPlaylist } from "../services/youtube"
import {
  getCache, setCache, getState, saveState,
  getSettings, saveSettings, getSections, saveSections
} from "../utils/storage"

export function usePlaylist() {
  const [playlist, setPlaylist] = useState(null)
  const [state, setState] = useState(getState())
  const [settings, setSettings] = useState(getSettings())
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadPlaylist = useCallback(async (url) => {
    const id = (url.match(/[?&]list=([^&]+)/) || [])[1]
    if (!id) { setError("No playlist ID found"); return }

    setLoading(true)
    setError("")

    const cached = getCache(id)
    const now = Date.now()
    const STALE_MS = 24 * 60 * 60 * 1000

    if (cached && now - cached.fetchedAt < STALE_MS) {
      setPlaylist(cached)
    } else {
      try {
        const data = await fetchPlaylist(id)
        setCache(id, data)
        setPlaylist(data)
      } catch (e) {
        setError(e.message)
        if (cached) setPlaylist(cached)
      }
    }

    setLoading(false)
  }, [])

  const toggleWatch = useCallback((videoId) => {
    setState(prev => {
      const next = { ...prev }
      const cur = next[videoId] || { watched: false }
      next[videoId] = {
        ...cur,
        watched: !cur.watched,
        watchedAt: cur.watched ? null : new Date().toISOString()
      }
      saveState(next)
      return next
    })
  }, [])

  const saveNote = useCallback((videoId, note) => {
    setState(prev => {
      const next = { ...prev }
      next[videoId] = { ...(next[videoId] || {}), notes: note }
      saveState(next)
      return next
    })
  }, [])

  const updateSettings = useCallback((updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    saveSettings(next)
  }, [settings])

  return {
    playlist, setPlaylist,
    state, settings,
    sections, setSections,
    loading, error,
    loadPlaylist, toggleWatch, saveNote, updateSettings
  }
}
