'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'ACCESS DENIED — Invalid credentials.');
      }
    } catch {
      setError('Connection failed. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-panel" onSubmit={handleSubmit} autoComplete="off">
        <h1>NEXUS // AUTH</h1>
        <p>CLEARANCE GATE — AUTHORIZED PERSONNEL ONLY</p>

        {error && <div className="flash err">{error}</div>}

        <label htmlFor="username">Operator ID</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Passphrase</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
        </button>
      </form>
    </div>
  );
}
