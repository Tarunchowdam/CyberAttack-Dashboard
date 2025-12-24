import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import MapView from './pages/MapView';
import TableView from './pages/TableView';
import Login from './pages/Login';
import Register from './pages/Register';
import { useState } from 'react';

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem('auth') === '1');
  const loc = useLocation();
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('auth_user') || "Tarun";

  function handleLogout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('auth_user');
    setAuth(false);
    navigate('/login');
  }

  
  const ProtectedLayout = () => (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside>
        <div className="brand">
          <div className="logo">🛡</div>
          <div style={{ color: 'white', fontWeight: 700 }}>ThreatVision</div>
        </div>

        <div className="nav-title">NAVIGATION</div>
        <nav>
          <Link to="/map" className={loc.pathname === '/map' ? 'active' : ''}>🌐 Threat Map</Link>
          <Link to="/table" className={loc.pathname === '/table' ? 'active' : ''}>📋 Attack Events</Link>
        </nav>
      </aside>

      <main>
        <header>
          <div className="header-left">
            <div className="header-title">
              {loc.pathname === '/map' ? '🛡 Global Threat Map' : '🛡️ Attack Events'}
            </div>
          </div>

          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>⟳ Refresh</button>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{currentUser}</div>
            <button className="refresh-btn" onClick={handleLogout}>➜]</button>
          </div>
        </header>

        <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/map" />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/table" element={<TableView />} />
          </Routes>
        </div>
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => { setAuth(true); navigate('/map'); }} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={auth ? <ProtectedLayout /> : <Navigate to="/login" />} />
    </Routes>
  );
}
