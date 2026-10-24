import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import GanttTimeline from "@sambroda/gantt-timeline";
import "./style.css";

const initial = [
  {
    id: "V-01",
    label: "Previous agreement",
    validFrom: "2025-09-26",
    mandatoryFrom: "2026-10-16",
    invalidFrom: null,
    url: "https://example.com/previous",
  },
  {
    id: "A-01",
    label: "Current agreement",
    validFrom: "2026-10-12",
    mandatoryFrom: "2026-11-05",
    invalidFrom: "2026-12-29",
    url: "https://example.com/current",
  },
  {
    id: "N-01",
    label: "Next agreement",
    validFrom: "2026-10-29",
    mandatoryFrom: "2026-11-23",
    invalidFrom: null,
    url: "https://example.com/next",
  },
];
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function App() {
  const [data, setData] = useState(initial);
  const [json, setJson] = useState(JSON.stringify(initial, null, 2));
  const [referenceDate, setReferenceDate] = useState(todayISO());
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const openCount = useMemo(
    () => data.filter((item) => !item.invalidFrom).length,
    [data],
  );
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${referenceDate}T12:00:00`));

  function updateJson(value) {
    setJson(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed))
        throw new Error("The JSON root must be an array.");
      setData(parsed);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> LOCAL PLAYGROUND{" "}
            <span className="eyebrow-separator">/</span> REACT COMPONENT
          </div>
          <h1>
            Gantt <span>Timeline</span>
          </h1>
          <p>
            Explore validity periods, key dates and open-ended records — without
            publishing a package.
          </p>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <span className="mark-line mark-line-one" />
          <span className="mark-line mark-line-two" />
          <span className="mark-line mark-line-three" />
          <span className="mark-dot" />
        </div>
      </header>

      <section className="control-panel">
        <div className="control-copy">
          <span className="section-kicker">VIEW CONTROLS</span>
          <h2>Timeline overview</h2>
          <p>Choose a reference date to move the “today” marker.</p>
        </div>
        <label className="date-control">
          <span>Reference date</span>
          <div className="date-input-wrap">
            <span className="calendar-icon" aria-hidden="true">
              ▦
            </span>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              aria-label="Reference date for today marker"
            />
          </div>
          <small>Today marker: {dateLabel}</small>
        </label>
      </section>

      <section className="stats-grid" aria-label="Timeline summary">
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-label">TOTAL RECORDS</span>
            <span className="stat-icon blue">▤</span>
          </div>
          <strong>{data.length.toString().padStart(2, "0")}</strong>
          <span className="stat-foot">Rows in this timeline</span>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-label">OPEN-ENDED</span>
            <span className="stat-icon green">↗</span>
          </div>
          <strong>{openCount.toString().padStart(2, "0")}</strong>
          <span className="stat-foot">No invalid-from date set</span>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-label">REFERENCE DATE</span>
            <span className="stat-icon red">│</span>
          </div>
          <strong className="date-stat">{dateLabel}</strong>
          <span className="stat-foot">Dashed vertical marker</span>
        </article>
      </section>

      <section className="chart-card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">VISUALIZATION</span>
            <h2>Validity schedule</h2>
            <p>Each row is one record. Hover the markers for exact dates.</p>
          </div>
          <span className="live-pill">
            <span /> LIVE PREVIEW
          </span>
        </div>
        <div className="chart-container">
          <GanttTimeline
            data={data}
            today={referenceDate}
            locale="en-GB"
            labels={{
              validFrom: "Valid from",
              mandatoryFrom: "Mandatory from",
              invalidFrom: "Invalid from",
              today: "TODAY",
            }}
            onRecordClick={(record) =>
              record.url &&
              window.open(record.url, "_blank", "noopener,noreferrer")
            }
          />
        </div>
        <div className="chart-foot">
          <span>
            <span className="foot-dot" /> Updates instantly as you edit the data
          </span>
          <span>SVG · Responsive · Keyboard accessible</span>
        </div>
      </section>

      <section className="data-card">
        <button
          className="editor-toggle"
          type="button"
          onClick={() => setEditorOpen(!editorOpen)}
          aria-expanded={editorOpen}
        >
          <span className="editor-icon">{`{ }`}</span>
          <span className="editor-title">
            <strong>Data editor</strong>
            <small>Adjust records using JSON</small>
          </span>
          <span className={`chevron ${editorOpen ? "expanded" : ""}`}>⌄</span>
        </button>
        {editorOpen && (
          <div className="editor-body">
            <div className="editor-help">
              <span>INPUT DATA</span>
              <span>JSON ARRAY</span>
            </div>
            <textarea
              spellCheck="false"
              value={json}
              onChange={(e) => updateJson(e.target.value)}
              aria-label="Timeline JSON data"
            />
            {error && (
              <p className="error-message">Could not update chart: {error}</p>
            )}
            <p className="editor-note">
              Required fields: <code>id</code>, <code>label</code>,{" "}
              <code>validFrom</code>, <code>mandatoryFrom</code>. Use{" "}
              <code>null</code> for an open-ended <code>invalidFrom</code>.
            </p>
          </div>
        )}
      </section>
      <footer>
        <span>GANTT TIMELINE</span>
        <span>Local demo · Changes are not published automatically</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
