import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If they picked remember me previously, pre-fill
    const savedUser = localStorage.getItem('savedUsername');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) return;

    setLoading(true);

    try {
      // Hardcoded bypass for ease in local dev
      if (username === 'stucco_club' && password === 'stucco123') {
           localStorage.setItem('token', 'fake-token-stucco');
           localStorage.setItem('user', JSON.stringify({ id: 'dummy', username: 'stucco_club', role: 'club' }));
           if(rememberMe) localStorage.setItem('savedUsername', username); else localStorage.removeItem('savedUsername');
           navigate('/dashboard-club'); return;
      }

      const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({username: data.username, role: data.role}));
      if(rememberMe) localStorage.setItem('savedUsername', username); else localStorage.removeItem('savedUsername');

      const role = data.role;
      if (role === 'club' || role === 'club_coordinator') navigate('/dashboard-club');
      else if (role === 'faculty' || role === 'faculty_in_charge') navigate('/dashboard-faculty');
      else if (role === 'admin') navigate('/dashboard-admin');
      else navigate('/');

    } catch (err) {
      if (err.message === 'Failed to fetch') {
          setError('Server error. Is the backend running?');
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pt-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card auth-card border-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="mb-3"><i className="fas fa-lock fa-3x text-gradient"></i></div>
                <h3 className="fw-bold text-gradient">Welcome Back</h3>
                <p className="text-muted small">Enter your credentials to access your dashboard</p>
              </div>
              
              {error && <div className="alert alert-danger" role="alert"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">USERNAME</label>
                  <input type="text" className="form-control form-control-custom bg-light" placeholder="e.g. stucco_club" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label text-muted small fw-bold">PASSWORD</label>
                    <a href="#" className="small text-decoration-none" style={{color: '#764ba2'}}>Forgot Password?</a>
                  </div>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} className="form-control form-control-custom bg-light border-end-0" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button className="btn btn-light border border-start-0 text-muted" type="button" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <label className="form-check-label text-muted small" htmlFor="rememberMe">Remember me</label>
                </div>
                <button type="submit" className="btn btn-gradient btn-lg w-100 fw-bold shadow-sm" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {loading ? 'Logging in...' : 'Login securely'}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted mb-0">Don't have an account? <Link to="/signup" className="text-decoration-none fw-bold" style={{color: '#764ba2'}}>Sign up now</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
