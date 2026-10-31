import { useState } from 'react';
import CustomerList from './pages/CustomerList';
import { authApi } from './api/auth.api';
import { setAccessToken, clearAccessToken } from './api/client';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(username, password);
      setAccessToken(result.token);
      setUser(result.user);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setUser(null);
    setUsername('');
    setPassword('');
    setError('');
  }

  if (!user) {
    return (
      <main style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#f4f6fa', padding: 20
      }}>
        <form onSubmit={handleLogin} style={{
          width: '100%', maxWidth: 380, padding: 28,
          borderRadius: 12, background: '#fff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
        }}>
          <h2>Đăng nhập hệ thống</h2>
          <p>Quản lý hồ sơ khách hàng Mekong Mobile</p>

          <label htmlFor="login-username">Tên đăng nhập</label>
          <input
            id="login-username" type="text" value={username}
            onChange={event => setUsername(event.target.value)}
            required autoComplete="username"
            style={{ width: '100%', padding: 10, margin: '8px 0 16px', boxSizing: 'border-box' }}
          />

          <label htmlFor="login-password">Mật khẩu</label>
          <input
            id="login-password" type="password" value={password}
            onChange={event => setPassword(event.target.value)}
            required autoComplete="current-password"
            style={{ width: '100%', padding: 10, margin: '8px 0 16px', boxSizing: 'border-box' }}
          />

          {error && <p role="alert" style={{ color: '#c62828' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        gap: 12, padding: '10px 20px', background: '#f4f6fa'
      }}>
        <span>{user.full_name} ({user.role})</span>
        <button type="button" onClick={handleLogout}>Đăng xuất</button>
      </div>
      <CustomerList user={user} />
    </>
  );
}

export default App;
