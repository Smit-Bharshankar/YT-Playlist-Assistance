import { useEffect, useRef, useState } from "react"

function toMinutes(value) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function useBudgetDraft(value, otherValue, onChange) {
  const current = toMinutes(value)
  const other = toMinutes(otherValue)
  const [draft, setDraft] = useState(String(current))
  const [error, setError] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(String(current))
    }
  }, [current])

  useEffect(() => {
    if (other > 0) setError("")
  }, [other])

  const validate = (n) => {
    if (n === 0 && other === 0) {
      setError("At least one budget must be above 0.")
      return false
    }
    setError("")
    return true
  }

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "")
    setDraft(digits)

    if (digits === "") {
      setError("")
      return
    }

    const n = Number(digits)
    if (!Number.isSafeInteger(n)) {
      setError("Enter a whole number of minutes.")
      return
    }

    if (!validate(n)) return
    if (n !== current) onChange(n)
  }

  const handleFocus = (e) => {
    const input = e.currentTarget
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return
      if (input.selectionStart !== input.selectionEnd) return
      const end = input.value.length
      input.setSelectionRange(end, end)
    })
  }

  const handleBlur = () => {
    if (draft === "") {
      if (!validate(0)) {
        setDraft(String(current))
        setError("")
        return
      }
      setDraft("0")
      if (current !== 0) onChange(0)
      return
    }

    const n = Number(draft)
    if (!Number.isSafeInteger(n) || !validate(n)) {
      setDraft(String(current))
      setError("")
      return
    }

    setDraft(String(n))
    if (n !== current) onChange(n)
  }

  return { draft, error, inputRef, handleChange, handleBlur, handleFocus }
}
