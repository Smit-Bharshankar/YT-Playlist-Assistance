export default function WatchPlanner({ playlist, state, settings, updateSettings }) {
  if (!playlist) return null;

  const unwatched = playlist.items.filter(v => !state[v.videoId] || !state[v.videoId].watched);
  const remainingSec = unwatched.reduce((a, b) => a + b.durationSec, 0);
  const dailySec = settings.dailyBudgetMinutes * 60;
  const days = remainingSec <= 0 ? 0 : Math.ceil(remainingSec / dailySec);

  return (
    <section className="planner">
      <h3>⏱️ Watch planner</h3>
      <div className="planner-grid">
        <div className="budget-field">
          <label>Daily budget</label>
          <input
            type="number"
            value={settings.dailyBudgetMinutes}
            onChange={e => updateSettings({ dailyBudgetMinutes: parseInt(e.target.value) || 30 })}
          />
          <span className="unit">min</span>
        </div>
        <div className="budget-field">
          <label>Weekend budget</label>
          <input
            type="number"
            value={settings.weekendBudgetMinutes}
            onChange={e => updateSettings({ weekendBudgetMinutes: parseInt(e.target.value) || 60 })}
          />
          <span className="unit">min</span>
        </div>
      </div>
      <div className="planner-stats">
        <span><strong>{unwatched.length}</strong> videos left</span>
        <span>•</span>
        <span><strong>{Math.floor(remainingSec / 60)}h {remainingSec % 60}m</strong> remaining</span>
      </div>
      <div className="planner-result">
        Est. days to finish: <strong>{days}</strong> day{days !== 1 ? "s" : ""}
      </div>
      {days > 0 && (
        <div className="day-split">
          <h4>Suggested daily split (in order)</h4>
          {generateDays(unwatched, dailySec).map((day, i) => (
            <div key={i} className="day-block">
              <span className="day-label">Day {i + 1}</span>
              <span className="day-titles">{day.videos.map(v => v.title).join(" → ")}</span>
              <span className="day-duration">({Math.floor(day.total / 60)} min)</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function generateDays(videos, dailySec) {
  const days = [];
  let current = [];
  let currentSec = 0;

  for (const v of videos) {
    if (currentSec + v.durationSec > dailySec && current.length > 0) {
      days.push({ videos: current, total: currentSec });
      current = [];
      currentSec = 0;
    }
    current.push(v);
    currentSec += v.durationSec;
  }
  if (current.length > 0) days.push({ videos: current, total: currentSec });
  return days;
}
