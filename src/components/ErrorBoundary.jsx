import { Component } from "react"

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("Playlist Tracker crashed:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <img src="/logo.svg" alt="" width="48" height="48" />
          <h1>Something went wrong.</h1>
          <p>Your saved progress and notes are still in this browser. Reload the app to continue.</p>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
