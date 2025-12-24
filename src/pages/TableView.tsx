
import { useAttacksData } from '../api/useAttacksData';
import { useMemo, useState } from 'react';

export default function TableView() {
  const data = useAttacksData();
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const countries = useMemo(() => Array.from(new Set(data.map(d => d.Country).filter(Boolean))), [data]);
  const types = useMemo(() => Array.from(new Set(data.map(d => d.AttackType).filter(Boolean))), [data]);
  const systems = useMemo(() => Array.from(new Set(data.map(d => d.AffectedSystem).filter(Boolean))), [data]);
  const protocols = useMemo(() => Array.from(new Set(data.map(d => d.Protocol).filter(Boolean))), [data]);
  const sourceIPs = useMemo(() => Array.from(new Set(data.map(d => d.SourceIP).filter(Boolean))), [data]);

  const [fCountry, setFCountry] = useState('');
  const [fType, setFType] = useState('');
  const [fSystem, setFSystem] = useState('');
  const [fProtocol, setFProtocol] = useState('');
  const [fSourceIP, setFSourceIP] = useState('');
  const [fconfidence, setFConfidence] = useState('');
  
  const filtered = useMemo(() =>
    data.filter(d =>
      (fCountry ? d.Country === fCountry : true) &&
      (fType ? d.AttackType === fType : true) &&
      (fSystem ? d.AffectedSystem === fSystem : true) &&
      (fProtocol ? d.Protocol === fProtocol : true) &&
      (fSourceIP ? d.SourceIP.includes(fSourceIP) : true)
    ), [data, fCountry, fType, fSystem, fProtocol,fSourceIP]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="filters">
        <select value={fCountry} onChange={e => { setFCountry(e.target.value); setPage(0); }}>
          <option value="">Country</option>
          {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select value={fType} onChange={e => { setFType(e.target.value); setPage(0); }}>
          <option value="">Attack Type</option>
          {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>

        <select value={fSystem} onChange={e => { setFSystem(e.target.value); setPage(0); }}>
          <option value="">Affected System</option>
          {systems.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select value={fProtocol} onChange={e => { setFProtocol(e.target.value); setPage(0); }}>
          <option value="">Protocol</option>
          {protocols.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ borderRadius: 12, padding: 12, background: 'linear-gradient(180deg,#071421,#061421)', border: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🔎  Attack Events ({filtered.length})</div>
        <table>
          <thead>
            <tr>
              <th>Country</th><th>Attack Type</th><th>Affected System</th><th>Protocol</th><th>Confidence</th><th>Source IP</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((d, i) => (
              <tr key={i}>
                <td>{d.Country}</td>
                <td style={{ color: 'var(--accent)' }}>{d.AttackType}</td>
                <td>{d.AffectedSystem}</td>
                <td>{d.Protocol}</td>
                <td><span className="confidence">{(d.confidence*100).toFixed(2)}%</span></td>
                <td style={{ color: 'var(--muted)' }}>{d.SourceIP}</td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No rows</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center',justifyContent:'center' }}>
          <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= filtered.length}>Next</button>
          <div style={{ color: 'var(--muted)' }}>Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
        </div>
      </div>
    </div>
  );
}

