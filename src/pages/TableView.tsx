import { useAttacksData } from '../api/useAttacksData';
import { useMemo, useState } from 'react';

export default function TableView() {
  const { data, loading, error } = useAttacksData();

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState('');
  const pageSize = 15;

  // Filters options
  const countries = useMemo(() => [...new Set(data.map(d => d.Country).filter(Boolean))], [data]);
  const types = useMemo(() => [...new Set(data.map(d => d.AttackType).filter(Boolean))], [data]);
  const systems = useMemo(() => [...new Set(data.map(d => d.AffectedSystem).filter(Boolean))], [data]);
  const protocols = useMemo(() => [...new Set(data.map(d => d.Protocol).filter(Boolean))], [data]);

  // Filter state
  const [fCountry, setFCountry] = useState('');
  const [fType, setFType] = useState('');
  const [fSystem, setFSystem] = useState('');
  const [fProtocol, setFProtocol] = useState('');
  const [fSourceIP, setFSourceIP] = useState('');

  // Filtered data
  const filtered = useMemo(
    () =>
      data.filter(d =>
        (fCountry ? d.Country === fCountry : true) &&
        (fType ? d.AttackType === fType : true) &&
        (fSystem ? d.AffectedSystem === fSystem : true) &&
        (fProtocol ? d.Protocol === fProtocol : true) &&
        (fSourceIP ? d.SourceIP?.includes(fSourceIP) : true)
      ),
    [data, fCountry, fType, fSystem, fProtocol, fSourceIP]
  );

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const pagination = useMemo(() => {
    const pages: (number | string)[] = [];
    const lastPage = totalPages - 1;
    const window = 2;

    pages.push(0);

    if (page > window + 1) pages.push('…');

    for (
      let i = Math.max(1, page - window);
      i <= Math.min(lastPage - 1, page + window);
      i++
    ) {
      pages.push(i);
    }

    if (page < lastPage - window - 1) pages.push('…');

    if (lastPage > 0) pages.push(lastPage);

    return pages;
  }, [page, totalPages]);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(p, 0), totalPages - 1));
  };

  return (
    <div>
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#fff', padding: 40 }}>
          Loading attack data...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', color: 'red', padding: 40 }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="filters">
            
            <select value={fCountry} onChange={e => { setFCountry(e.target.value); goToPage(0); }}>
              <option value="">Country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={fType} onChange={e => { setFType(e.target.value); goToPage(0); }}>
              <option value="">Attack Type</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={fSystem} onChange={e => { setFSystem(e.target.value); goToPage(0); }}>
              <option value="">Affected System</option>
              {systems.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={fProtocol} onChange={e => { setFProtocol(e.target.value); goToPage(0); }}>
              <option value="">Protocol</option>
              {protocols.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ fontWeight: 700, marginBottom: 12 }}>🔎 Attack Events ({filtered.length.toLocaleString('en-IN')})</div>
          {/* Table */}
          <table>
            
            <thead>
              <tr>
                <th>Country</th>
                <th>Attack Type</th>
                <th>Affected System</th>
                <th>Protocol</th>
                <th>Confidence</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {paged.length ? (
                paged.map((d, i) => (
                  <tr key={i}>
                    <td>{d.Country}</td>
                    <td>{d.AttackType}</td>
                    <td>{d.AffectedSystem}</td>
                    <td>{d.Protocol}</td>
                    <td>{(d.confidence * 100).toFixed(2)}%</td>
                    <td>{d.SourceIP || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            marginTop: 16,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button disabled={page === 0} onClick={() => goToPage(page - 1)}>
              « Prev
            </button>

            {pagination.map((p, i) =>
              p === '…' ? (
                <span key={i} style={{ padding: '0 6px', opacity: 0.6 }}>…</span>
              ) : (
                <button
                  key={i}
                  onClick={() => goToPage(p as number)}
                  style={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: 4,
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: p === page ? '#00d8ff' : 'transparent',
                    color: p === page ? '#000' : '#fff'
                  }}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <button disabled={page === totalPages - 1} onClick={() => goToPage(page + 1)}>
              Next »
            </button>

            {/* Go to page */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.7 }}>
              <span>Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={e => setPageInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const n = Number(pageInput);
                    if (!isNaN(n)) goToPage(n - 1);
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
              <span> / {totalPages}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
