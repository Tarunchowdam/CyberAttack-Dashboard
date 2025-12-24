import { useState } from "react";
import { addUser } from "../db/indexedDB";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function submit(e: any) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMsg("Please fill all fields");
      return;
    }

    await addUser(email, password, "user");
    setMsg("Registration successful!");
    setTimeout(() => navigate("/login"), 1200);
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="logo" style={{
                          margin: '0 auto',
                          fontSize: 72,
                          color: "#00f2ff",
                          textShadow: "0 0 30px #00f2ff, 0 0 60px #00f2ff, 0 0 100px #00f2ff"
                          }}>🛡</div>
        </div>

        <h2>Create Account</h2>
        <p>Register to access the security dashboard</p>

        {msg && <p style={{ color: "#4caf50", fontSize: 13 }}>{msg}</p>}

        <label style={{ fontWeight: 700, fontSize: 13, color: "#9fbfd0" }}>Email</label>
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="analyst@security.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label
          style={{
            marginTop: 12,
            display: "block",
            fontWeight: 700,
            fontSize: 13,
            color: "#9fbfd0",
          }}
        >
          Password
        </label>
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="*********"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-btn" type="submit">Register</button>

        <p
          style={{ marginTop: 12, fontSize: 12, cursor: "pointer", color: "#9fbfd0", textAlign:"center" }}
          onClick={() => navigate("/login")}
        >
          Already have an account? Sign In
        </p>
      </form>
    </div>
  );
}
