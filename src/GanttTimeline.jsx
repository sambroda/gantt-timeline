import React, { useMemo } from "react";
import "./GanttTimeline.css";

const DEFAULT_LABELS = { validFrom:"VALID FROM", mandatoryFrom:"MANDATORY FROM", invalidFrom:"INVALID FROM", today:"TODAY", openEnded:"Open-ended" };
const parseDate = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return NaN;
  const n = Date.parse(`${v}T00:00:00Z`);
  return Number.isFinite(n) && new Date(n).toISOString().slice(0,10) === v ? n : NaN;
};
const iso = n => Number.isFinite(n) ? new Date(n).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
const addDays = (d,n) => iso(parseDate(d) + n*86400000);
const days = (a,b) => (parseDate(b)-parseDate(a))/86400000;
const fmt = (v,locale) => Number.isFinite(parseDate(v)) ? new Intl.DateTimeFormat(locale,{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"UTC"}).format(new Date(parseDate(v))) : "—";
const month = (v,locale) => Number.isFinite(parseDate(v)) ? new Intl.DateTimeFormat(locale,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(parseDate(v))) : "";
function ticks(start,end) {
 const span=Math.max(1,days(start,end)), step=span>300?30:span>160?14:span>75?7:span>35?5:1, out=[];
 for(let i=0;i<=span;i+=step) out.push(addDays(start,i));
 if(out[out.length-1]!==end) out.push(end); return out;
}

/**
 * Reusable SVG Gantt chart.
 * @param {{data:Array<{id:string,label:string,validFrom:string,mandatoryFrom:string,invalidFrom?:string|null,url?:string}>,today?:string,locale?:string,labels?:object,colors?:object,showToday?:boolean,showLegend?:boolean,showRecordLabels?:boolean,className?:string,minWidth?:number,rowHeight?:number,labelWidth?:number,chartWidth?:number,onRecordClick?:(record:object)=>void,openLinksInNewTab?:boolean}} props
 */
export function GanttTimeline({
 data=[], today=iso(Date.now()), locale="en-GB", labels={}, colors={}, showToday=true, showLegend=true,
 showRecordLabels=true, className="", minWidth=760, rowHeight=72, labelWidth=280, chartWidth=850,
 onRecordClick, openLinksInNewTab=true
}) {
 const text={...DEFAULT_LABELS,...labels};
 const color={bar:"#438cf0",validFrom:"#438cf0",mandatoryFrom:"#526782",invalidFrom:"#27a66a",...colors};
 const m=useMemo(()=>{
  const dates=[today]; data.forEach(r=>dates.push(r.validFrom,r.mandatoryFrom,...(r.invalidFrom?[r.invalidFrom]:[])));
  const valid=dates.flat().map(parseDate).filter(Number.isFinite), bounds=valid.length?valid:[Date.now()];
  const low=Math.min(...bounds),high=Math.max(...bounds),span=Math.max(1,(high-low)/86400000),pad=Math.max(14,Math.ceil(span*.14));
  const start=addDays(iso(low),-pad),end=addDays(iso(high),pad),plotX=labelWidth,plotW=chartWidth,top=58,height=top+data.length*rowHeight+25;
  const x=d=>plotX+days(start,d)/Math.max(1,days(start,end))*plotW;
  return {start,end,ticks:ticks(start,end),plotX,plotW,top,height,x};
 },[data,today,labelWidth,chartWidth,rowHeight]);
 const {start,end,plotX,plotW,top,height,x}=m, width=labelWidth+chartWidth+30;
 const tx=x(Number.isFinite(parseDate(today))?today:iso(Date.now()));
 function activate(r) {
  if(onRecordClick) onRecordClick(r);
  else if(r.url) window.open(r.url,openLinksInNewTab?"_blank":"_self",openLinksInNewTab?"noopener,noreferrer":undefined);
 }
 return <div className={`gt-root ${className}`}>
  {showLegend&&<div className="gt-legend">
   <span><i className="gt-key gt-valid-key"/>{text.validFrom}</span><span><i className="gt-key gt-mandatory-key"/>{text.mandatoryFrom}</span><span><i className="gt-key gt-invalid-key"/>{text.invalidFrom}</span>
   {showToday&&<span><i className="gt-today-key"/>{text.today}: {fmt(today,locale)}</span>}
  </div>}
  <div className="gt-scroll"><svg style={{minWidth}} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={labels.ariaLabel||"Gantt timeline"}>
   <text x={plotX} y="16" className="gt-month">{month(start,locale)}</text><text x={plotX+plotW} y="16" textAnchor="end" className="gt-month">{month(end,locale)}</text>
   {m.ticks.map(t=><g key={t}><line x1={x(t)} x2={x(t)} y1={top-10} y2={height-12} className="gt-grid"/><text x={x(t)} y="39" textAnchor="middle" className="gt-tick">{fmt(t,locale).slice(0,5)}</text></g>)}
   {data.map((r,i)=>{
    const y=top+i*rowHeight, begin=r.validFrom, endDate=r.invalidFrom||end, sx=x(begin), ex=Math.max(sx+3,Math.min(plotX+plotW,x(endDate))), mx=x(r.mandatoryFrom), ix=x(r.invalidFrom||end), clickable=Boolean(r.url||onRecordClick);
    return <g key={r.id??i} className={`gt-row${clickable?" gt-clickable":""}`} onClick={clickable?()=>activate(r):undefined}
      onKeyDown={clickable?e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(r)}}:undefined} tabIndex={clickable?0:undefined} role={clickable?"link":undefined}>
      <line x1="0" x2={width} y1={y+rowHeight-2} y2={y+rowHeight-2} className="gt-rowline"/>
      {showRecordLabels&&<><text x="12" y={y+16} className="gt-id">{r.id}</text><text x="12" y={y+33} className="gt-label">{r.label||""}</text>{r.url&&<text x="12" y={y+49} className="gt-url">{r.url.length>36?r.url.slice(0,33)+"…":r.url}</text>}</>}
      <rect x={sx} y={y+23} width={Math.max(2,ex-sx)} height="20" rx="6" fill={color.bar}><title>{`${r.id}: ${text.validFrom} ${fmt(r.validFrom,locale)}; ${text.mandatoryFrom} ${fmt(r.mandatoryFrom,locale)}; ${text.invalidFrom} ${r.invalidFrom?fmt(r.invalidFrom,locale):text.openEnded}`}</title></rect>
      <circle cx={x(r.validFrom)} cy={y+33} r="6" fill={color.validFrom} stroke="#fff" strokeWidth="2"><title>{`${text.validFrom}: ${fmt(r.validFrom,locale)}`}</title></circle>
      <path d={`M ${mx} ${y+24} l 9 9 l -9 9 l -9 -9 Z`} fill={color.mandatoryFrom} stroke="#fff" strokeWidth="2"><title>{`${text.mandatoryFrom}: ${fmt(r.mandatoryFrom,locale)}`}</title></path>
      {r.invalidFrom?<circle cx={ix} cy={y+33} r="6.5" fill={color.invalidFrom} stroke="#fff" strokeWidth="2"><title>{`${text.invalidFrom}: ${fmt(r.invalidFrom,locale)}`}</title></circle>:<path d={`M ${ex-7} ${y+24} L ${ex+1} ${y+33} L ${ex-7} ${y+42}`} fill="none" stroke={color.bar} strokeWidth="2.3"><title>{text.openEnded}</title></path>}
     </g>;
   })}
   {showToday&&<><line x1={tx} x2={tx} y1="22" y2={height-12} className="gt-todayline"/><rect x={Math.max(plotX,Math.min(width-75,tx-30))} y="2" width="60" height="17" rx="5" className="gt-todaypill"/><text x={Math.max(plotX,Math.min(width-75,tx-30))+30} y="14" textAnchor="middle" className="gt-todaytext">{text.today}</text></>}
  </svg></div>
 </div>;
}
export default GanttTimeline;
