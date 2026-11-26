import { Clock } from "./Icons"
import { useBudgetDraft } from "../hooks/useBudgetDraft"

export default function WatchPlanner({ playlist, state, settings, updateSettings }) {
  const daily = useBudgetDraft(
    settings.dailyBudgetMinutes,
    settings.weekendBudgetMinutes,
    (minutes) => updateSettings({ dailyBudgetMinutes: minutes })
  )
  const weekend = useBudgetDraft(
    settings.weekendBudgetMinutes,
    settings.dailyBudgetMinutes,
    (minutes) => updateSettings({ weekendBudgetMinutes: minutes })
  )

  if (!playlist) return null;

  const unwatched = playlist.items.filter(v => !state[v.videoId] || !state[v.videoId].watched);
  const remainingSec = unwatched.reduce((a, b) => a + b.durationSec, 0);
  const planMinutes = settings.dailyBudgetMinutes > 0 ? settings.dailyBudgetMinutes : settings.weekendBudgetMinutes;
  const dailySec = planMinutes * 60;
  const days = remainingSec <= 0 || dailySec <= 0 ? 0 : Math.ceil(remainingSec / dailySec);

  return (
    <section className="planner">
      <div className="planner__head">
        <h2 className="planner__title">
          <Clock size={18} />
          Watch planner
        </h2>
      </div>

      <div className="planner__reading">
        <span className="reading">
          {Math.floor(remainingSec / 3600)}h {Math.floor((remainingSec % 3600) / 60)}m
        </span>
        <span className="reading__label">remaining</span>
      </div>

      <div className="planner__figures">
        <div className="stat">
          <span className="figure">{unwatched.length}</span>
          <span className="figure-label">videos left</span>
        </div>
        <div className="stat">
          <span className="figure">{days}</span>
          <span className="figure-label">Est. days to finish</span>
        </div>
      </div>

      <div className="planner__budgets">
        <div className="budget-field">
          <label className="budget-label" htmlFor="daily-budget">Daily budget</label>
          <span className={`budget-control ${daily.error ? "has-error" : ""}`}>
            <input
              ref={daily.inputRef}
              id="daily-budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={daily.draft}
              onChange={daily.handleChange}
              onBlur={daily.handleBlur}
              onFocus={daily.handleFocus}
              aria-invalid={daily.error ? true : undefined}
              aria-describedby={daily.error ? "daily-budget-error" : undefined}
            />
            <span className="unit">min</span>
          </span>
          {daily.error && (
            <span className="budget-error" id="daily-budget-error" role="alert">
              {daily.error}
            </span>
          )}
        </div>
        <div className="budget-field">
          <label className="budget-label" htmlFor="weekend-budget">Weekend budget</label>
          <span className={`budget-control ${weekend.error ? "has-error" : ""}`}>
            <input
              ref={weekend.inputRef}
              id="weekend-budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={weekend.draft}
              onChange={weekend.handleChange}
              onBlur={weekend.handleBlur}
              onFocus={weekend.handleFocus}
              aria-invalid={weekend.error ? true : undefined}
              aria-describedby={weekend.error ? "weekend-budget-error" : undefined}
            />
            <span className="unit">min</span>
          </span>
          {weekend.error && (
            <span className="budget-error" id="weekend-budget-error" role="alert">
              {weekend.error}
            </span>
          )}
        </div>
      </div>

      {days > 0 && (
        <div className="day-split">
          <h3 className="day-split__title">Suggested daily split (in order)</h3>
          <ol className="day-split__list">
            {generateDays(unwatched, dailySec).map((day, i) => (
              <li key={i} className="day-block">
                <span className="day-label">Session {i + 1}</span>
                <span className="day-titles">{day.videos.map(v => v.title).join(", ")}</span>
                <span className="day-duration">{Math.floor(day.total / 60)} min</span>
              </li>
            ))}
          </ol>
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
