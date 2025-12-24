import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useAttacksData } from '../api/useAttacksData';
import { useState } from 'react';
import Tooltip from '../components/Tooltip';

export default function MapView() {
  const data = useAttacksData() || [];
  const [tooltip, setTooltip] = useState<any>(null);

  // group by country
  const grouped = data.reduce((acc: any, d: any) => {
    acc[d.Country] = acc[d.Country] || [];
    acc[d.Country].push(d);
    return acc;
  }, {});

  // normalize country names
  function normalizeCountry(s: string) {
    if (!s) return '';
    const t = String(s).toLowerCase().replace(/[^a-z]/g, '');
    if (t === 'usa' || t === 'us' || t.startsWith('unitedstates')) return 'unitedstates';
    if (t === 'uk' || t.startsWith('unitedkingdom')) return 'unitedkingdom';
    if (t.includes('korea') && t.includes('south')) return 'southkorea';
    if (t.includes('korea') && t.includes('north')) return 'northkorea';
    if (t.startsWith('russia')) return 'russia';
    return t;
  }
  const totalAttacks = data.length;
  const detectedThreats = data.filter((e) => e.confidence >= 75).length;
  const countriesAffected = Object.keys(grouped).length;

  // normalized grouping
  const normalizedGrouped = Object.keys(grouped).reduce((acc: any, c) => {
    const n = normalizeCountry(c);
    acc[n] = acc[n] || [];
    acc[n] = acc[n].concat(grouped[c]);
    return acc;
  }, {});

  return (
    <div>
      {/* CARDS */}
      <div className="cards">
        <div className="card">
          📈 Total Attacks
          <div style={{ fontSize: 28, fontWeight: 800 }}>{totalAttacks}</div>
        </div>
        <div className="card">
          ⚠︎ Detected Threats
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>45,121</div>
        </div>
        <div className="card">
          🛡 Countries Affected
          <div style={{ fontSize: 28, fontWeight: 800 }}>{countriesAffected}</div>
        </div>
      </div>

      {/* MAP */}
      <div className="map-panel">
        <div className="map-header">
          <div style={{ fontWeight: 700 }}>🔴 Live Threat Map</div>
          <div className="legend" style={{ display: "flex", gap: 12 }}>
            <span className="legend-pill" style={{ color: "var(--accent)" }}>● &lt;1K</span>
            <span className="legend-pill" style={{ color: "hsl(38,92%,45%)" }}>● 1K–5K</span>
            <span className="legend-pill" style={{ color: "var(--danger)" }}>● &gt;5K</span>
          </div>
        </div>

        <div style={{ height: 420 }}>
          <ComposableMap style={{ width: "100%", height: 620 }}>
            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name || '';
                  const attacks =
                    normalizedGrouped[normalizeCountry(geoName)] || grouped[geoName];

                  let content: JSX.Element | null = null;

                  if (attacks && attacks.length) {
                    const byType: any = {};

                    attacks.forEach((a: any) => {
                      const t = a.AttackType || 'Unknown';
                      byType[t] = byType[t] || { count: 0, systems: new Set<string>() };
                      byType[t].count += 1;
                      if (a.AffectedSystem) byType[t].systems.add(a.AffectedSystem);
                    });

                    content = (
                      <div>
                        <div className="title">{geoName}</div>
                        <div style={{ marginTop: 6, color: 'var(--muted)' }}>
                          Total: {attacks.length} attacks
                        </div>

                        <div style={{ marginTop: 8, fontWeight: 700 }}>
                          Detected Attacks:
                        </div>

                        <div style={{ marginTop: 8 }}>
                          {Object.entries(byType).map(([type, info]: any, i) => (
                            <div key={i} className="tooltip-row">
                              <div style={{ maxWidth: 200 }}>{type}</div>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div className="count-pill">{info.count}</div>
                                <div
                                  style={{
                                    color: 'var(--muted)',
                                    maxWidth: 160,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {Array.from(info.systems).join(', ')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const hasAttacks = !!attacks?.length;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseMove={(e) => {
                        if (content) {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            content,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { fill: hasAttacks ? '#d9534f' : '#1a2230' },
                        hover: { fill: hasAttacks ? '#ff5a3c' : '#2b3440' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      {/* TOOLTIP */}
      <Tooltip {...tooltip} />
    </div>
  );
}
