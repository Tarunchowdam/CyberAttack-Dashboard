import { useAttacksData } from '../api/useAttacksData';
import { useMemo, useState } from 'react';

export default function TableView() {
  const data = useAttacksData();
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState('');
  const pageSize = 15;

  const countries = useMemo(() => Array.from(new Set(data.map(d => d.Country).filter(Boolean))), [data]);
  const types = useMemo(() => Array.from(new Set(data.map(d => d.AttackType).filter(Boolean))), [data]);
  const systems = useMemo(() => Array.from(new Set(data.map(d => d.AffectedSystem).filter(Boolean))), [data]);
  const protocols = useMemo(() => Array.from(new Set(data.map(d => d.Protocol).filter(Boolean))), [data]);

  const [fCountry, setFCountry] = useState('');
  const [fType, setFType] = useState('');
  const [fSystem, setFSystem] = useState('');
  const [fProtocol, setFProtocol] = useState('');
  const [fSourceIP, setFSourceIP] = useState('');

  const filtered = useMemo(
    () =>
      data.filter(d =>
        (fCountry ? d.Country === fCountry : true) &&
        (fType ? d.AttackType === fType : true) &&
        (fSystem ? d.AffectedSystem === fSystem : true) &&
        (fProtocol ? d.Protocol === fProtocol : true) &&
        (fSourceIP ? (d.SourceIP ? d.SourceIP.includes(fSourceIP) : false) : true)
      ),
    [data, fCountry, fType, fSystem, fProtocol, fSourceIP]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const pagination = useMemo(() => {
    const pages: string[] = [];
    const lastPage = totalPages - 1;
    const windowSize = 4;

    const add = (p:any) => {
      if (!pages.includes(p)) pages.push(p);
    };

    add(0);

    if (page > windowSize) {
      pages.push('…');
    }

    const start = Math.max(1, page - 1);
    const end = Math.min(lastPage - 1, page + windowSize - 2);
    for (let i = start; i <= end; i++) add(i);

    if (page < lastPage - windowSize + 1) {
      pages.push('…');
    }

    if (lastPage > 0) add(lastPage);

    return pages;
  }, [page, totalPages]);

  const goToPage = (p:any) => {
    const safePage = Math.min(Math.max(p, 0), totalPages - 1);
    setPage(safePage);
  };

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select value={fCountry} onChange={e => { setFCountry(e.target.value); goToPage(0); }}>
          <option value="">Country</option>
          {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select value={fType} onChange={e => { setFType(e.target.value); goToPage(0); }}>
          <option value="">Attack Type</option>
          {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>

        <select value={fSystem} onChange={e => { setFSystem(e.target.value); goToPage(0); }}>
          <option value="">Affected System</option>
          {systems.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select value={fProtocol} onChange={e => { setFProtocol(e.target.value); goToPage(0); }}>
          <option value="">Protocol</option>
          {protocols.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, padding: 12, background: 'linear-gradient(180deg,#071421,#061421)', border: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🔎 Attack Events ({filtered.length.toLocaleString('en-IN')})</div>
        <table>
          <thead>
            <tr>
              <th>Country</th><th>Attack Type</th><th>Affected System</th><th>Protocol</th><th>Confidence</th><th>Source IP</th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((d, i) => (
                <tr key={i}>
                  <td>{d.Country}</td>
                  <td>{d.AttackType}</td>
                  <td>{d.AffectedSystem}</td>
                  <td>{d.Protocol}</td>
                  <td>{d.confidence ? (d.confidence * 100).toFixed(2) + '%' : '0%'}</td>
                  <td>{d.SourceIP || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No rows</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button disabled={page === 0} onClick={() => goToPage(page - 1)}>« Prev</button>

          {pagination.map((p, i) =>
            p === '…' ? (
              <span key={i} style={{ padding: '0 6px', opacity: 0.6 }}>…</span>
            ) : (
              <button
                key={i}
                onClick={() => goToPage(p)}
                style={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: 4,
                  fontWeight: 600,
                  padding: 4,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: typeof p === 'number' && p === page ? '#00d8ff' : 'transparent',
                  color: typeof p === 'number' && p === page ?  '#000' : '#fff'
                }}
              >
                {p + 1}
              </button>
            )
          )}

          <button disabled={page === totalPages - 1} onClick={() => goToPage(page + 1)}>Next »</button>
          
          {/* Page search */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.7,paddingLeft:10 }}>
            <span>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const raw = Number(pageInput);
                  if (!isNaN(raw)) goToPage(raw - 1);
                  setPageInput('');
                }
              }}
              style={{
                width: 64,
                height: 32,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: '#fff',
                textAlign: 'center'
              }}
            />
            <span> / {totalPages.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
