import React, { useState, useEffect } from "react";
import { SectionHeader } from "./AppShell.jsx";
import { api } from "./api.js";

// =====================================================================
// Global search results page — matches grouped by module, each badged
// with where it lives. Click opens the item in its actual module page.
// =====================================================================
const MODMETA = {
  api:       { label: "API 360",       color: "#159943", nav: "API 360 → Sources" },
  data:      { label: "Data 360",      color: "#0091bf", nav: "Data 360" },
  datapoint: { label: "Datapoint 360", color: "#0f4775", nav: "Datapoint 360" },
  interface: { label: "Interface 360", color: "#b8528a", nav: "Interface 360" },
  loader:    { label: "Loaders",       color: "#7c3aed", nav: "Data 360 → Loaders" },
  pii:       { label: "PII Explorer",  color: "#c1113a", nav: "PII Explorer" },
};
const ORDER = ["api", "data", "datapoint", "interface", "loader", "pii"];

export default function SearchResults({ t, onOpen }) {
  const initial = decodeURIComponent((window.location.hash.split("?")[1] || "")
    .split("&").find((p) => p.startsWith("q="))?.slice(2) || "");
  const [q, setQ] = useState(initial);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const h = setTimeout(() => {
      if (q && q.length >= 2) api.search(q).then(setData);
      else setData(null);
    }, 200);
    return () => clearTimeout(h);
  }, [q]);

  const results = data?.results || [];
  const byMod = {};
  results.forEach((r) => { (byMod[r.module] = byMod[r.module] || []).push(r); });
  const showMods = (filter ? [filter] : ORDER).filter((m) => byMod[m]);

  const hl = (text) => {
    if (!q) return text;
    const i = (text || "").toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    return (<>{text.slice(0, i)}<span style={{ background: "#fff3b0", borderRadius: 2 }}>{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</>);
  };

  const subOf = (r) => {
    if (r.subtitle) return r.subtitle;   // unified search_index provides this
    if (r.kind === "api_field") return `API field · ${r.description || ""}`;
    if (r.kind === "api_error") return `API error · ${r.description || ""}`;
    if (r.kind === "flow") return `business flow · ${r.description || ""}`;
    if (r.kind === "pipeline") return `pipeline · ${r.business_domain || ""}`;
    if (r.kind === "feed") return `inbound feed${r.business_domain ? " · " + r.business_domain : ""}`;
    if (r.kind === "field") return `field · ${r.data_type || ""}`;
    if (r.kind === "datapoint") return `datapoint · ${r.occurrence_count || 0} occurrences${r.module_count ? " · " + r.module_count + " modules" : ""}`;
    if (r.kind === "loader") return `loader · ${r.business_domain || ""}${r.version ? " · v" + r.version : ""}`;
    if (r.kind === "loader_attr") return `loader attribute · ${r.optionality || ""}`;
    if (r.kind === "canonical") return `canonical field · ${r.canonical_data_type || ""}`;
    if (r.kind === "api") return r.description || "API endpoint";
    if (r.kind === "pii") return r.description || "PII attribute";
    if (r.kind === "dataset") return r.object_type === "INTERFACE" ? "interface" : (r.description || "");
    return r.description || "";
  };

  return (
    <div>
      <SectionHeader t={t}>Search</SectionHeader>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search across all modules…"
          style={{ flex: "0 1 480px", padding: "11px 16px", fontSize: 15, fontFamily: t.font,
            border: `1px solid ${t.border}`, borderRadius: 24 }} />
        {data && <span style={{ fontSize: 13, color: t.sub || t.textMuted }}>
          <b style={{ color: t.navy }}>{data.total}</b> result{data.total !== 1 ? "s" : ""} for "{data.query}"</span>}
      </div>

      {!data && <div style={{ background: t.panel, border: `1px dashed ${t.border}`, borderRadius: 10,
        padding: 40, textAlign: "center", color: t.muted || t.textMuted }}>
        <div style={{ fontSize: 16, color: t.navy, fontWeight: 600, marginBottom: 8 }}>Global Search</div>
        Searches every module — API 360, Data 360, Datapoint 360, Interface 360, Loaders, PII.<br />
        Type at least 2 characters. Click any result to open it in its module.</div>}

      {data && results.length === 0 && <div style={{ color: t.muted, fontSize: 14, padding: 20 }}>
        No matches for "{q}".</div>}

      {data && results.length > 0 && (
        <>
          {/* module filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <Chip t={t} on={filter === null} onClick={() => setFilter(null)} label="All" count={results.length} />
            {ORDER.filter((m) => byMod[m]).map((m) => (
              <Chip key={m} t={t} on={filter === m} onClick={() => setFilter(filter === m ? null : m)}
                label={MODMETA[m].label} count={byMod[m].length} dot={MODMETA[m].color} />))}
          </div>

          {/* grouped sections */}
          {showMods.map((m) => {
            const meta = MODMETA[m];
            return (
              <div key={m} style={{ marginBottom: 26 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px",
                  display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px",
                  paddingBottom: 8, borderBottom: `2px solid ${t.border}` }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color }}></span>
                  {meta.label}
                  <span style={{ fontSize: 10, color: t.muted, fontWeight: 500 }}>→ {meta.nav}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: t.muted, fontWeight: 600 }}>
                    {byMod[m].length} match{byMod[m].length > 1 ? "es" : ""}</span>
                </h2>
                {byMod[m].map((r, i) => (
                  <div key={`${r.kind}-${r.name}-${i}`} onClick={() => onOpen(r.nav)}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: t.panel,
                      border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 16px",
                      marginBottom: 8, cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.hover || meta.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#fff", background: meta.color,
                      padding: "3px 8px", borderRadius: 3, minWidth: 84, textAlign: "center" }}>{meta.label}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.navy }}>{hl(r.name)}</div>
                      <div style={{ fontSize: 12, color: t.sub || t.textMuted, marginTop: 2 }}>{subOf(r)}</div>
                    </div>
                    {r.project_id && <span style={{ fontSize: 8, fontWeight: 700, color: "#fff",
                      background: "#0091bf", padding: "2px 6px", borderRadius: 3 }}>{(r.project_id || "").toUpperCase()}</span>}
                    {r.is_pii === "Y" && <span style={{ fontSize: 8, fontWeight: 700, color: "#fff",
                      background: "#c1113a", padding: "2px 6px", borderRadius: 3 }}>PII</span>}
                    <span style={{ marginLeft: "auto", color: t.muted, fontSize: 18 }}>›</span>
                  </div>))}
              </div>);
          })}
        </>)}
    </div>
  );
}

function Chip({ t, on, onClick, label, count, dot }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, fontWeight: 600, padding: "6px 13px",
      borderRadius: 16, cursor: "pointer", fontFamily: t.font, display: "flex", alignItems: "center", gap: 6,
      border: `1px solid ${on ? t.accent : t.border}`,
      background: on ? (t.infoBg || "#e0f5fd") : t.panel, color: on ? t.accent : (t.sub || t.text) }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }}></span>}
      {label} <span style={{ fontSize: 10, background: t.bgsoft || "#eef3f3", borderRadius: 8,
        padding: "1px 6px", color: t.sub }}>{count}</span>
    </button>);
}
