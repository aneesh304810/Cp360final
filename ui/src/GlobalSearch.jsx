import React, { useState, useEffect, useRef } from "react";
import { api } from "./api.js";

const TYPE_COLOR = { FEED: "#b45309", MODEL: "#0091bf", DAG: "#7c3aed",
  TABLE: "#64748b", VIEW: "#159943" };

// Global catalog search: searches datasets/feeds/models by name + description,
// with a live results dropdown. Hits /search (LIKE on object_name + desc),
// falls back to mock in DEMO mode.
export default function GlobalSearch({ t, onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const h = setTimeout(() => {
      api.search(q).then((r) => { setResults(r.results || []); setOpen(true); setActive(0); });
    }, 220);   // debounce
    return () => clearTimeout(h);
  }, [q]);

  const pick = (r) => {
    setOpen(false); setQ("");
    if (onPick) onPick(r);
  };

  const onKey = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={box} style={{ position: "relative", marginLeft: 18, width: 300 }}>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.12)",
        borderRadius: t.radius.pill, padding: "0 12px", height: 32 }}>
        <span style={{ color: "#9fb3cf", fontSize: 13, marginRight: 6 }}>{"\u26B2"}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search datasets, feeds, models\u2026"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: 13, fontFamily: t.font }} />
        {q && <span onClick={() => { setQ(""); setResults([]); }}
          style={{ cursor: "pointer", color: "#9fb3cf", fontSize: 14 }}>{"\u2715"}</span>}
      </div>

      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: 38, left: 0, right: 0, background: t.panel,
          border: `1px solid ${t.disabled}`, borderRadius: t.radius.md, boxShadow: t.shadow.lg,
          maxHeight: 360, overflowY: "auto", zIndex: 50 }}>
          {results.map((r, i) => {
            // unify across kinds: datasets use object_name/object_type,
            // fields/feeds/datapoints use kind/name
            const kind = r.kind || "dataset";
            const name = r.name || r.object_name;
            const badge = kind === "dataset" ? (r.object_type || "DATA")
              : kind === "field" ? "FIELD"
              : kind === "feed" ? (r.direction ? r.direction.toUpperCase() : "FEED")
              : "DATAPOINT";
            const badgeColor = TYPE_COLOR[r.object_type]
              || (kind === "field" ? "#7c3aed"
                  : kind === "feed" ? "#0091bf"
                  : kind === "datapoint" ? "#159943" : t.muted);
            const sub = kind === "dataset"
              ? `${r.platform_id}.${r.schema_name} \u00b7 ${r.project_id || ""}`
              : kind === "field"
              ? `${r.dataset_key || ""}${r.is_pii === "Y" ? "  \u00b7 PII" : ""}`
              : kind === "feed"
              ? `${r.direction || ""} feed \u00b7 ${r.business_domain || ""} \u00b7 ${r.frequency || ""}`
              : `${r.occurrence_count || 0} occurrences across ${r.module_count || 0} modules${r.is_pii === "Y" ? " \u00b7 PII" : ""}`;
            return (
            <div key={`${kind}-${name}-${i}`}
              onMouseEnter={() => setActive(i)} onMouseDown={() => pick(r)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                cursor: "pointer", background: i === active ? t.infoBg : t.panel,
                borderBottom: `1px solid ${t.bg}` }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff",
                background: badgeColor, padding: "2px 6px",
                borderRadius: t.radius.sm, minWidth: 42, textAlign: "center" }}>{badge}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      {open && q.trim() && results.length === 0 && (
        <div style={{ position: "absolute", top: 38, left: 0, right: 0, background: t.panel,
          border: `1px solid ${t.disabled}`, borderRadius: t.radius.md, padding: "12px",
          fontSize: 12, color: t.textMuted, zIndex: 50 }}>
          No matches for {`"${q}"`}
        </div>
      )}
    </div>
  );
}
