import React, { useState, useEffect } from 'react';

// Grouped, viewport-aware collapsing sidebar navigation.
const BREAKPOINT = 1200;
const GRAPH_ROUTES = new Set(['data']);

const NAV_GROUPS = [
  { group: null, items: [['home', 'Home', '\u2302']] },
  { group: 'Catalog', items: [
    ['interface', 'Interface 360', '\u21C4'],
    ['api', 'API 360', '\u25C8'],
    ['data', 'Data 360', '\u25A4'],
    ['datapoint', 'Datapoint 360', '\u25C9'],
  ] },
  { group: 'Governance', items: [
    ['pii', 'PII Explorer', '\u2691'],
    ['guardrails', 'Quality Guardrails', '\u26A0'],
  ] },
  { group: 'Architecture', items: [
    ['system', 'System Design', '\u26EC'],
  ] },
];

export default function AppShell({ t, route, onNav, live, onSearch, children }) {
  const [manual, setManual] = useState(null);
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT : false);

  useEffect(() => {
    const onResize = () => {
      const isNarrow = window.innerWidth < BREAKPOINT;
      setNarrow((prev) => {
        if (prev !== isNarrow) setManual(null);
        return isNarrow;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const autoCollapsed = narrow || GRAPH_ROUTES.has(route);
  const collapsed = manual === null ? autoCollapsed : manual;

  const submitSearch = (val) => {
    const v = (val || '').trim();
    if (!v) return;
    window.location.hash = `search?q=${encodeURIComponent(v)}`;
    if (onSearch) onSearch(v);
  };

  const railW = collapsed ? 54 : 216;

  return (
    <div style={{ minWidth: t.minWidth, minHeight: '100vh', background: t.bg,
      color: t.text, fontFamily: t.font }}>
      <div style={{ height: 56, background: t.navy, color: '#fff', display: 'flex',
        alignItems: 'center', padding: '0 20px', gap: 16, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: t.pop, letterSpacing: 1, lineHeight: 1, marginBottom: 1 }}>360{'\u00b0'}</div>
          <div style={{ width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.pop}, ${t.accent})`,
            display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 12,
            letterSpacing: '.5px', border: `2px solid ${t.pop}` }}>CP</div>
        </div>
        <div><b style={{ fontSize: 17, fontWeight: 600 }}>CP <span style={{ color: t.pop, fontWeight: 800 }}>360{'\u00b0'}</span></b>
          <span style={{ color: '#8fa6c4', fontSize: 11, marginLeft: 8 }}>
            Brown Brothers Harriman &middot; Capital Partners</span></div>
        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '3px 9px',
          borderRadius: t.radius.pill,
          color: live ? '#bfe' : '#fc9', background: live ? 'rgba(21,153,67,0.25)' : 'rgba(230,126,34,0.25)' }}>
          {'\u25CF'} {live ? 'LIVE' : 'DEMO'}</span>
        <input placeholder="Search all modules…  (press Enter)"
          onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(e.target.value); }}
          style={{ marginLeft: 'auto', width: 280, height: 32, borderRadius: t.radius.pill,
            border: 'none', outline: 'none', padding: '0 14px', fontSize: 13, fontFamily: t.font,
            background: 'rgba(255,255,255,0.14)', color: '#fff' }} />
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        <nav style={{ width: railW, flexShrink: 0, background: t.navy,
          transition: 'width 0.18s ease', padding: '8px 8px', overflowY: 'auto' }}>
          <div onClick={() => setManual(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              color: '#7f8fb0', fontSize: 12, padding: collapsed ? '8px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: t.radius.md,
              marginBottom: 6 }}>
            <span>{collapsed ? '\u00BB' : '\u00AB'}</span>
            {!collapsed && <span>Collapse</span>}
          </div>
          {NAV_GROUPS.map((grp, gi) => (
            <div key={gi}>
              {grp.group && !collapsed && (
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.5px', color: '#5f6f8f', padding: '12px 12px 5px' }}>{grp.group}</div>
              )}
              {grp.group && collapsed && (
                <div style={{ textAlign: 'center', color: '#3a4767', padding: '10px 0 4px', fontSize: 10 }}>{'\u2022\u2022\u2022'}</div>
              )}
              {grp.items.map(([k, label, icon]) => {
                const active = route === k;
                return (
                  <a key={k} onClick={() => onNav(k)} title={collapsed ? label : ''}
                    style={{ display: 'flex', alignItems: 'center', gap: 10,
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: t.radius.md, cursor: 'pointer', marginBottom: 1,
                      fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden',
                      color: active ? '#fff' : '#c5d2e4',
                      background: active ? t.accent : 'transparent' }}>
                    <span style={{ width: 16, textAlign: 'center', flexShrink: 0, opacity: 0.9 }}>{icon}</span>
                    {!collapsed && <span>{label}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{ flex: 1, minWidth: 0, padding: '26px 34px 60px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ t, children }) {
  return (
    <h1 style={{ fontSize: 24, fontWeight: 500, color: t.accent,
      borderBottom: `2px solid ${t.accent}`, paddingBottom: 15, margin: '0 0 30px' }}>
      {children}</h1>
  );
}

export function FullscreenPanel({ t, title, children }) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setFull(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const wrap = full
    ? { position: 'fixed', inset: 0, zIndex: 200, background: t.panel, borderRadius: 0 }
    : { position: 'relative', background: t.panel, border: `1px solid ${t.border}`, borderRadius: t.radius.md };
  return (
    <div style={wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        borderBottom: `1px solid ${t.border}`, background: t.bg }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.4px', color: t.sub }}>{title}</span>
        <button onClick={() => setFull((f) => !f)}
          style={{ marginLeft: 'auto', border: `1px solid ${t.border}`, background: t.panel,
            borderRadius: t.radius.md, cursor: 'pointer', fontSize: 12, padding: '4px 10px',
            color: t.sub }}>{'\u26F6'} {full ? 'Exit' : 'Full screen'}</button>
      </div>
      <div style={{ height: full ? 'calc(100vh - 45px)' : 'auto', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
