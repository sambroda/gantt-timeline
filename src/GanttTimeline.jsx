import { useMemo, useState } from "react";
import "./GanttTimeline.css";

const DEFAULT_LABELS = {
  validFrom: "VALID FROM",
  mandatoryFrom: "MANDATORY FROM",
  invalidFrom: "INVALID FROM",
  today: "TODAY",
  openEnded: "Open-ended",
};
const parseDate = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return NaN;
  const n = Date.parse(`${v}T00:00:00Z`);
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === v
    ? n
    : NaN;
};
const iso = (n) =>
  Number.isFinite(n)
    ? new Date(n).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
const addDays = (d, n) => iso(parseDate(d) + n * 86400000);
const days = (a, b) => (parseDate(b) - parseDate(a)) / 86400000;
const fmt = (v, locale) =>
  Number.isFinite(parseDate(v))
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(parseDate(v)))
    : "—";
function ticks(start, end) {
  const span = Math.max(1, days(start, end));
  // Choose calendar-aligned intervals so labels remain readable and predictable.
  const stepMonths =
    span > 1100 ? 6 : span > 520 ? 3 : span > 260 ? 2 : span > 150 ? 1 : 0;
  const out = [];
  if (stepMonths) {
    const startDate = new Date(parseDate(start)),
      endDate = new Date(parseDate(end));
    let cursor = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
    );
    while (cursor <= endDate) {
      const d = cursor.toISOString().slice(0, 10);
      if (d >= start && d <= end) out.push(d);
      cursor = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + stepMonths, 1),
      );
    }
  } else {
    const step =
      span > 75 ? 14 : span > 35 ? 7 : Math.max(1, Math.ceil(span / 8));
    for (let i = 0; i <= span; i += step) out.push(addDays(start, i));
  }
  if (!out.length || out[0] !== start) out.unshift(start);
  if (out[out.length - 1] !== end) out.push(end);
  return out;
}
function tickLabel(v, locale, span) {
  const d = new Date(parseDate(v));
  if (span > 150)
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    }).format(d);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Reusable SVG Gantt chart.
 * @param {{data:Array<{id:string,label:string,validFrom:string,mandatoryFrom:string,invalidFrom?:string|null,url?:string}>,today?:string,locale?:string,labels?:object,colors?:object,showToday?:boolean,showLegend?:boolean,showRecordLabels?:boolean,className?:string,minWidth?:number,rowHeight?:number,labelWidth?:number,chartWidth?:number,onRecordClick?:(record:object)=>void,openLinksInNewTab?:boolean}} props
 */
export function GanttTimeline({
  data = [],
  today = iso(Date.now()),
  locale = "en-GB",
  labels = {},
  colors = {},
  showToday = true,
  showLegend = true,
  showRecordLabels = true,
  className = "",
  minWidth = 760,
  rowHeight = 72,
  labelWidth = 280,
  chartWidth = 850,
  onRecordClick,
  openLinksInNewTab = true,
}) {
  const [focusedRecordId, setFocusedRecordId] = useState(null);
  const text = { ...DEFAULT_LABELS, ...labels };
  const color = {
    bar: "#438cf0",
    validFrom: "#438cf0",
    mandatoryFrom: "#526782",
    invalidFrom: "#27a66a",
    ...colors,
  };
  const m = useMemo(() => {
    const focused =
      focusedRecordId == null
        ? null
        : data.find((r) => String(r.id) === String(focusedRecordId));
    const dates = focused
      ? [
          focused.validFrom,
          focused.mandatoryFrom,
          ...(focused.invalidFrom ? [focused.invalidFrom] : []),
        ]
      : [
          today,
          ...data.flatMap((r) => [
            r.validFrom,
            r.mandatoryFrom,
            ...(r.invalidFrom ? [r.invalidFrom] : []),
          ]),
        ];
    const valid = dates.flat().map(parseDate).filter(Number.isFinite),
      bounds = valid.length ? valid : [Date.now()];
    const low = Math.min(...bounds),
      high = Math.max(...bounds),
      span = Math.max(1, (high - low) / 86400000),
      pad = Math.max(14, Math.ceil(span * 0.14));
    const start = addDays(iso(low), -pad),
      end = addDays(iso(high), pad),
      plotX = labelWidth,
      plotW = chartWidth,
      top = 58,
      height = top + data.length * rowHeight + 25;
    const x = (d) =>
      plotX + (days(start, d) / Math.max(1, days(start, end))) * plotW;
    const axisTicks = ticks(start, end);
    const yearTicks = axisTicks.filter(
      (t, i) =>
        i === 0 ||
        new Date(parseDate(t)).getUTCFullYear() !==
          new Date(parseDate(axisTicks[i - 1])).getUTCFullYear(),
    );
    return {
      start,
      end,
      ticks: axisTicks,
      yearTicks,
      span,
      plotX,
      plotW,
      top,
      height,
      x,
    };
  }, [data, today, labelWidth, chartWidth, rowHeight, focusedRecordId]);
  const { end, plotX, plotW, top, height, x, span } = m,
    width = labelWidth + chartWidth + 30;
  const tx = x(Number.isFinite(parseDate(today)) ? today : iso(Date.now()));
  function focusRecord(r) {
    setFocusedRecordId((current) =>
      String(current) === String(r.id) ? null : r.id,
    );
  }
  function activateLink(r) {
    if (onRecordClick) onRecordClick(r);
    else if (r.url)
      window.open(
        r.url,
        openLinksInNewTab ? "_blank" : "_self",
        openLinksInNewTab ? "noopener,noreferrer" : undefined,
      );
  }

  return (
    <div className={`gt-root ${className}`}>
      {showLegend && (
        <div className="gt-legend">
          <span>
            <i className="gt-key gt-valid-key" />
            {text.validFrom}
          </span>
          <span>
            <i className="gt-key gt-mandatory-key" />
            {text.mandatoryFrom}
          </span>
          <span>
            <i className="gt-key gt-invalid-key" />
            {text.invalidFrom}
          </span>
          {showToday && (
            <span>
              <i className="gt-today-key" />
              {text.today}: {fmt(today, locale)}
            </span>
          )}
        </div>
      )}
      <div className="gt-scroll">
        <svg
          style={{ minWidth }}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={labels.ariaLabel || "Gantt timeline"}
        >
          {span > 150 &&
            m.yearTicks.map((t) => (
              <text key={`year-${t}`} x={x(t) + 3} y="16" className="gt-year">
                {new Date(parseDate(t)).getUTCFullYear()}
              </text>
            ))}
          {m.ticks.map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={top - 10}
                y2={height - 12}
                className="gt-grid"
              />
              <text x={x(t)} y="39" textAnchor="middle" className="gt-tick">
                {tickLabel(t, locale, span)}
              </text>
            </g>
          ))}
          {data.map((r, i) => {
            const y = top + i * rowHeight,
              begin = r.validFrom,
              endDate = r.invalidFrom || end,
              sx = x(begin),
              ex = Math.max(sx + 3, Math.min(plotX + plotW, x(endDate))),
              mx = x(r.mandatoryFrom),
              ix = x(r.invalidFrom || end),
              focused = String(focusedRecordId) === String(r.id);
            const focusKey = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                focusRecord(r);
              }
            };
            return (
              <g
                key={r.id ?? i}
                className={`gt-row${focused ? " gt-row-focused" : ""}`}
              >
                <line
                  x1="0"
                  x2={width}
                  y1={y + rowHeight - 2}
                  y2={y + rowHeight - 2}
                  className="gt-rowline"
                />
                {showRecordLabels && (
                  <>
                    <text
                      x="12"
                      y={y + 16}
                      className="gt-id gt-focusable"
                      role="button"
                      tabIndex="0"
                      aria-label={`Focus ${r.id}`}
                      onClick={() => focusRecord(r)}
                      onKeyDown={focusKey}
                    >
                      {r.id}
                    </text>
                    <text
                      x="12"
                      y={y + 33}
                      className="gt-label gt-focusable"
                      role="button"
                      tabIndex="0"
                      aria-label={`Focus ${r.label || r.id}`}
                      onClick={() => focusRecord(r)}
                      onKeyDown={focusKey}
                    >
                      {r.label || ""}
                    </text>
                    {r.url && (
                      <text
                        x="12"
                        y={y + 49}
                        className="gt-url gt-link"
                        role="link"
                        tabIndex="0"
                        aria-label={`Open ${r.url}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          activateLink(r);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            activateLink(r);
                          }
                        }}
                      >
                        {r.url.length > 36 ? r.url.slice(0, 33) + "…" : r.url}
                      </text>
                    )}
                  </>
                )}
                <rect
                  x={sx}
                  y={y + 23}
                  width={Math.max(2, ex - sx)}
                  height="20"
                  rx="6"
                  fill={color.bar}
                  className="gt-bar-focusable"
                  role="button"
                  tabIndex="0"
                  aria-label={`Focus timeline on ${r.id}`}
                  onClick={() => focusRecord(r)}
                  onKeyDown={focusKey}
                >
                  <title>{`${r.id}: ${text.validFrom} ${fmt(r.validFrom, locale)}; ${text.mandatoryFrom} ${fmt(r.mandatoryFrom, locale)}; ${text.invalidFrom} ${r.invalidFrom ? fmt(r.invalidFrom, locale) : text.openEnded}`}</title>
                </rect>
                <circle
                  cx={x(r.validFrom)}
                  cy={y + 33}
                  r="6"
                  fill={color.validFrom}
                  stroke="#fff"
                  strokeWidth="2"
                  className="gt-bar-focusable"
                  role="button"
                  tabIndex="0"
                  aria-label={`Focus timeline on ${r.id}`}
                  onClick={() => focusRecord(r)}
                  onKeyDown={focusKey}
                >
                  <title>{`${text.validFrom}: ${fmt(r.validFrom, locale)}`}</title>
                </circle>
                <path
                  d={`M ${mx} ${y + 24} l 9 9 l -9 9 l -9 -9 Z`}
                  fill={color.mandatoryFrom}
                  stroke="#fff"
                  strokeWidth="2"
                  className="gt-bar-focusable"
                  role="button"
                  tabIndex="0"
                  aria-label={`Focus timeline on ${r.id}`}
                  onClick={() => focusRecord(r)}
                  onKeyDown={focusKey}
                >
                  <title>{`${text.mandatoryFrom}: ${fmt(r.mandatoryFrom, locale)}`}</title>
                </path>
                {r.invalidFrom ? (
                  <circle
                    cx={ix}
                    cy={y + 33}
                    r="6.5"
                    fill={color.invalidFrom}
                    stroke="#fff"
                    strokeWidth="2"
                    className="gt-bar-focusable"
                    role="button"
                    tabIndex="0"
                    aria-label={`Focus timeline on ${r.id}`}
                    onClick={() => focusRecord(r)}
                    onKeyDown={focusKey}
                  >
                    <title>{`${text.invalidFrom}: ${fmt(r.invalidFrom, locale)}`}</title>
                  </circle>
                ) : (
                  <path
                    d={`M ${ex - 7} ${y + 24} L ${ex + 1} ${y + 33} L ${ex - 7} ${y + 42}`}
                    fill="none"
                    stroke={color.bar}
                    strokeWidth="2.3"
                    className="gt-bar-focusable"
                    role="button"
                    tabIndex="0"
                    aria-label={`Focus timeline on ${r.id}`}
                    onClick={() => focusRecord(r)}
                    onKeyDown={focusKey}
                  >
                    <title>{text.openEnded}</title>
                  </path>
                )}
              </g>
            );
          })}
          {showToday && (
            <>
              <line
                x1={tx}
                x2={tx}
                y1="22"
                y2={height - 12}
                className="gt-todayline"
                stroke="#e5484d"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
              <rect
                x={Math.max(plotX, Math.min(width - 75, tx - 30))}
                y="2"
                width="60"
                height="17"
                rx="5"
                className="gt-todaypill"
                fill="#e5484d"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x={Math.max(plotX, Math.min(width - 75, tx - 30)) + 30}
                y="14"
                textAnchor="middle"
                className="gt-todaytext"
                fill="#ffffff"
                fontSize="9"
                fontWeight="850"
              >
                {text.today}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
export default GanttTimeline;
