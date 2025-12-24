import { useState, useEffect } from 'react';
import { validateUser, insertDefaultUser } from '../db/indexedDB';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    insertDefaultUser(); // ensures at least 1 user exists
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) {
      setError("Please enter credentials");
      return;
    }

    const ok = await validateUser(user, pass);
    if (ok) {
      localStorage.setItem('auth', '1');
      localStorage.setItem('auth_user', user);
      onLogin();
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="logo" style={{
                          margin: '0 auto',
                          fontSize: 72,
                          color: "#00f2ff",
                          textShadow: "0 0 30px #00f2ff, 0 0 60px #00f2ff, 0 0 100px #00f2ff"
                          }}>🛡</div>
          </div>

        <h2>Threat Intelligence</h2>
        <p>Sign in to access the security dashboard</p>

        {error && <p style={{ color: "tomato", fontSize: 13 }}>{error}</p>}

        <label style={{ fontWeight: 700, fontSize: 13, color: '#9fbfd0' }}>Email</label>
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="analyst@security.io"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
        </div>

        <label style={{ marginTop: 12, display: 'block', fontWeight: 700, fontSize: 13, color: '#9fbfd0' }}>
          Password
        </label>
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="*********"
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
        </div>

        <button className="login-btn" type="submit">Sign In</button>

        <p
          style={{ marginTop: 12, fontSize: 12, cursor: "pointer", color: "#9fbfd0", textAlign:"center" }}
          onClick={() => navigate("/register")}
        >
          New user? Create an account
        </p>
      </form>
    </div>
  );
}
