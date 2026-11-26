<p align="center">
  <img src="public/logo.svg" width="72" height="72" alt="Playlist Tracker logo" />
</p>

<h1 align="center">Playlist Tracker</h1>

<p align="center">A local-first watch queue for YouTube playlists: order, watched state, notes, and a daily plan.</p>

## What it does

Paste a YouTube playlist URL, then work through it in playlist order. Playlist Tracker keeps the watched state, notes, and daily planning in your browser, so there is no account and no server-side history.

## Features

- Import any public YouTube playlist by URL.
- Watch the playlist in order with a clear “Up next” row.
- Mark videos watched and keep per-video notes.
- Search by title or channel; filter to watched or unwatched.
- Daily and weekend budgets with numeric validation.
- Planner readout: time remaining, videos left, estimated days, and suggested sessions.
- Embedded player plus a direct “Watch on YouTube” link.
- JSON backup and restore for watch state, notes, and settings.
- Responsive layout from 320px up, with keyboard focus states and reduced-motion support.

## Stack

- React 18 and Vite 5
- Plain CSS with a token-based design system
- A Vercel serverless function that proxies the YouTube Data API v3
- `localStorage` for playlist cache, watch state, notes, and settings

## Getting started

### Requirements

- Node 18 or newer. Node 20 is recommended (`.nvmrc`).
- A YouTube Data API v3 key.

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and set the key:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

The key is server-side only. Do not prefix it with `VITE_`, because that would expose it to the browser.

### Local development

```bash
npm run dev
```

`npm run dev` starts the Vite client only. Importing a playlist calls `/api/playlist`, and Vite does not run serverless functions. For the full stack locally, install the Vercel CLI and run:

```bash
vercel dev
```

Alternatively, point the client at a deployed API by changing `BASE` in `src/services/youtube.js`.

### Production build

```bash
npm run build
npm run preview
```

The build output is `dist/`.

## Deploy to Vercel

1. Import the repository into Vercel.
2. Add `YOUTUBE_API_KEY` under Project Settings → Environment Variables.
3. Deploy. Vercel detects Vite, builds with `npm run build`, and serves `dist/`.

`vercel.json` keeps the API route working, serves the single-page app, adds basic security headers, and gives hashed assets a long cache.

The production URL is `https://playlist.smitxcode.in/`. The canonical, `og:url`, `og:image`, and `twitter:image` values in `index.html` point at that origin. If the domain changes, update those four values so social crawlers and search engines use the new origin.

## Security notes

- `YOUTUBE_API_KEY` is read only by `api/playlist.js`; it is never bundled into the client.
- `vercel.json` sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options`.
- The proxy has no rate limiting. Restrict the key to the YouTube Data API v3 in Google Cloud and monitor its quota.
- If you add a strict Content-Security-Policy later, allow `https://www.youtube.com` for the player, `https://i.ytimg.com` for thumbnails, and the Google Fonts hosts used in `index.html`.

## Data and privacy

- Playlist metadata is cached in `localStorage` for 24 hours.
- Watch state, notes, and budgets stay in `localStorage`; they are not sent to a server.
- Backup and restore use a JSON file you control.
- The serverless function only forwards playlist requests to YouTube; it does not store user data.
- Browser storage keys: `yt_playlist_cache`, `yt_watch_state`, `yt_settings`.

## Project structure

```text
api/
  playlist.js          YouTube Data API proxy for Vercel
public/
  logo.svg             Source brand mark
  favicon.ico          Legacy favicon
  favicon-16.png       Tab icon
  favicon-32.png       Tab icon
  apple-touch-icon.png iOS home screen
  icon-192.png         Web app manifest icon
  icon-512.png         Web app manifest icon
  icon-maskable-512.png Maskable manifest icon
  og-image.png         1200 x 630 social card
  site.webmanifest     Install metadata
  robots.txt           Crawler rules
src/
  App.jsx              App shell and screen composition
  index.css            Tokens, layout, components, states
  components/          Icons, video row, planner, modal, error boundary
  hooks/               Playlist state and budget draft logic
  services/youtube.js  Playlist API client
  utils/storage.js     localStorage helpers
```

## Brand assets

`public/logo.svg` is the source mark: an amber rounded square, a play triangle, and a check for watched state. The PNG favicons, app icons, maskable icon, ICO, and `og-image.png` are generated from that mark. If the logo changes, regenerate the raster assets at the sizes listed above.

The OG card uses the same graphite, amber, and pale-ink palette as the app.

## Known limits and next logic pass

These are intentional notes, not hidden behavior:

- The last playlist is not restored automatically after a reload. Paste or import it again.
- The ledger “Day N” groups count the whole playlist, while the planner’s “Session N” groups count only unwatched videos.
- The weekend budget is a fallback when the daily budget is `0`; there is no separate weekday/weekend schedule yet.
- The header Daily goal and the planner Daily budget edit the same setting.
- State is per-browser. Use Backup and Restore to move it between browsers.
- YouTube API quota is shared by the server key. The 24-hour client cache reduces repeat requests.
- The API route requires Vercel or `vercel dev`; the plain Vite dev server does not serve it.
- There is no offline service worker yet. The manifest provides install metadata, but the app needs the network for YouTube data and the player.
- There is no automated test suite yet. The current verification is the production build, the Hallmark design lint/render pass, and Lighthouse.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite client |
| `npm run build` | Build the production app into `dist/` |
| `npm run preview` | Preview the production build locally |

## License

Private project. `package.json` marks it `UNLICENSED`; change that if you decide to publish it.
