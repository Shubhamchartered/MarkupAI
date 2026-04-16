"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, FileXls, LockKey, User } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (username === "admin" && password === "password123") {
      localStorage.setItem("markup_auth", "true");
      router.push("/select-module");
    } else {
      setError("Invalid credentials. Please use 'admin' and 'password123' for this demo.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-icon" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1rem" }}>
            <Receipt weight="bold" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              MARKUP<span style={{ color: '#8B5CF6' }}>.AI</span>
            </div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', marginBottom: '0' }}>Intelligent Tax Platform</p>
            <p style={{ marginTop: '0.25rem' }}>Login to your subscription account</p>
        </div>

        {error && (
          <div style={{color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid var(--danger-color)'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="mf-group">
            <label className="mf-label">Subscription ID / Username</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input 
                type="text" 
                className="mf-input" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Enter unique ID"
              />
            </div>
          </div>
          <div className="mf-group" style={{marginTop: "1rem"}}>
            <label className="mf-label">Password</label>
            <div className="input-with-icon">
              <LockKey className="input-icon" />
              <input 
                type="password" 
                className="mf-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{width: "100%", marginTop: "2rem", padding: "0.8rem", fontSize: "1.1rem"}}>
            Sign In
          </button>
        </form>


      </div>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent), var(--bg);
        }
        .login-card {
          background: var(--bg-elevated);
          padding: 3rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          width: 100%;
          max-width: 460px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: var(--text-soft);
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-soft);
          font-size: 1.2rem;
        }
        .input-with-icon .mf-input {
          padding-left: 3rem;
        }
        .separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 2rem 0;
          color: var(--text-soft);
          font-size: 0.9rem;
        }
        .separator::before, .separator::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .separator span {
          padding: 0 1rem;
        }
        .import-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .import-box:hover {
          border-color: var(--primary-color);
        }
        .import-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .import-text strong {
          font-size: 0.95rem;
        }
        .import-text span {
          font-size: 0.8rem;
          color: var(--text-soft);
        }
      `}</style>
    </div>
  );
}
