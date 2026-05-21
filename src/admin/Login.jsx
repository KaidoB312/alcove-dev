import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = new URLSearchParams({ password });
    const res = await api('/auth/login', { method: 'POST', body: body.toString() });
    if (res.error) return setError(res.error);
    onLogin(res.token);
  };

  return (
    <div className="login-card contact-card" style={{ maxWidth: 400, margin: '4rem auto', textAlign: 'center' }}>
      <h2>Admin Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{ width: '100%', padding: '0.8rem', margin: '1rem 0', border: '1px solid var(--border)', borderRadius: '0.8rem', background: 'var(--card-bg)', fontFamily: 'inherit' }}
        />
        <button type="submit" className="btn primary" style={{ width: '100%' }}>Login</button>
      </form>
    </div>
  );
}
