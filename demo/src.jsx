import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import GanttTimeline from "@sambroda/gantt-timeline";
import "./style.css";
const initial=[
 {id:"V-01",label:"Previous agreement",validFrom:"2025-09-26",mandatoryFrom:"2026-10-16",invalidFrom:null,url:"https://example.com/previous"},
 {id:"A-01",label:"Current agreement",validFrom:"2026-10-12",mandatoryFrom:"2026-11-05",invalidFrom:"2026-12-29",url:"https://example.com/current"},
 {id:"N-01",label:"Next agreement",validFrom:"2026-10-29",mandatoryFrom:"2026-11-23",invalidFrom:null,url:"https://example.com/next"}
];
function App(){const [data,setData]=useState(initial),[json,setJson]=useState(JSON.stringify(initial,null,2)),[error,setError]=useState("");
return <main><h1>Gantt Timeline — local package demo</h1><p>Edits update the chart without publishing to npm.</p><GanttTimeline data={data} today="2026-10-24" locale="en-GB" onRecordClick={r=>alert(`Clicked ${r.id}\n${r.url||"No URL"}`)}/><h2>Input data</h2><textarea value={json} onChange={e=>{setJson(e.target.value);try{const v=JSON.parse(e.target.value);if(!Array.isArray(v))throw Error("JSON must be an array");setData(v);setError("")}catch(err){setError(err.message)}}}/>{error&&<p className="error">{error}</p>}</main>}
createRoot(document.getElementById("root")).render(<App/>);
