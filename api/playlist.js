// Vercel serverless function: proxies YouTube Data API v3

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { playlistId, pageToken } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("ERROR: YOUTUBE_API_KEY is not set");
    return res.status(500).json({ error: "YouTube API key not configured" });
  }
  if (!playlistId) {
    return res.status(400).json({ error: "playlistId is required" });
  }

  try {
    // Fetch one page of playlist items from YouTube
    const url =
      "https://www.googleapis.com/youtube/v3/playlistItems?" +
      `part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}` +
      (pageToken ? `&pageToken=${pageToken}` : "");

    console.log("Fetching playlist:", playlistId);
    const ytRes = await fetch(url);
    console.log("YouTube playlistItems status:", ytRes.status);

    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error("YouTube playlistItems error:", errText);
      return res.status(ytRes.status).json({ error: "YouTube API error: " + errText });
    }
    const data = await ytRes.json();

    if (!data.items || data.items.length === 0) {
      return res.status(200).json({
        playlistId,
        items: [],
        nextPageToken: null,
        totalResults: 0
      });
    }

    // Fetch durations for the video IDs on this page
    const videoIds = data.items.map((item) => item.contentDetails.videoId).join(",");
    const durRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
    );
    console.log("YouTube videos status:", durRes.status);

    if (!durRes.ok) {
      const errText = await durRes.text();
      console.error("YouTube videos error:", errText);
      return res.status(durRes.status).json({ error: "YouTube API error (durations): " + errText });
    }
    const durData = await durRes.json();

    function parseDuration(iso) {
      const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!m) return 0;
      return (
        parseInt(m[1] || 0, 10) * 3600 +
        parseInt(m[2] || 0, 10) * 60 +
        parseInt(m[3] || 0, 10)
      );
    }

    const items = data.items.map((item, i) => {
      const vid = durData.items.find((d) => d.id === item.contentDetails.videoId);
      return {
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        position: i + 1,
        durationSec: parseDuration(vid?.contentDetails?.duration || "PT0S")
      };
    });

    return res.status(200).json({
      playlistId,
      items,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || items.length
    });
  } catch (err) {
    console.error("Function crash:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
