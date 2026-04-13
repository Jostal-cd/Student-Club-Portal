import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'club', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'text-danger' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') checkStrength(e.target.value);
  };

  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    let label = 'Weak'; let color = 'text-danger';
    if (score === 2 || score === 3) { label = 'Medium'; color = 'text-warning'; }
    if (score === 4) { label = 'Strong'; color = 'text-success'; }
    setStrength({ score, label, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) return setError('You must agree to the Terms & Conditions.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    if (formData.username.length < 3) return setError('Username must be at least 3 characters.');
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) return setError('Username must be alphanumeric.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Signup failed');
      
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pt-5 mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card auth-card border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center fw-bold mb-4 text-gradient">Create Account</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label text-muted small fw-bold">First Name</label>
                    <input type="text" name="firstName" className="form-control form-control-custom bg-light" onChange={handleChange} required />
                  </div>
                  <div className="col">
                    <label className="form-label text-muted small fw-bold">Last Name</label>
                    <input type="text" name="lastName" className="form-control form-control-custom bg-light" onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Username</label>
                  <input type="text" name="username" className="form-control form-control-custom bg-light" onChange={handleChange} required minLength="3" />
                  <div className="form-text">Min 3 characters, alphanumeric.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Email</label>
                  <input type="email" name="email" className="form-control form-control-custom bg-light" onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Account Type</label>
                  <select name="role" className="form-select form-control-custom bg-light" onChange={handleChange}>
                    <option value="club">Club Coordinator</option>
                    <option value="faculty">Faculty-in-Charge</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Password</label>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} name="password" className="form-control form-control-custom bg-light border-end-0" onChange={handleChange} required />
                    <button className="btn btn-light border border-start-0 text-muted" type="button" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 small">Password Strength: <strong className={strength.color}>{strength.label}</strong></div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Confirm Password</label>
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-control form-control-custom bg-light" onChange={handleChange} required />
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" onChange={(e) => setAgreedToTerms(e.target.checked)} id="termsCheck" />
                  <label className="form-check-label text-muted small" htmlFor="termsCheck">
                    I agree to the Terms of Service & Privacy Policy
                  </label>
                </div>

                <button type="submit" className="btn btn-gradient btn-lg w-100 fw-bold" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted mb-0">Already have an account? <Link to="/login" className="text-decoration-none fw-bold" style={{color: '#764ba2'}}>Login here</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
