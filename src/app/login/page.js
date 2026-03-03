'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import './login.css';

/* ══ Optimized AADHUNIKA background
   - useMemo so rows never re-render
   - Only 6 rows × 16 words (doubled = 32 per row for seamless loop)
   - Zero per-word JS animations
══ */
const AadhunikaBackground = () => {
  const WORD    = 'AADHUNIKA';
  const ROWS    = 6;
  const COUNT   = 16; // per half — doubled in render for seamless CSS loop

  const rows = useMemo(() =>
    Array.from({ length: ROWS }, (_, i) => ({
      id: i,
      dir: i % 2 === 0 ? 'row-left' : 'row-right',
      words: Array.from({ length: COUNT * 2 }, (_, j) => j),
    })),
  []);

  return (
    <div className="aadhunika-bg" aria-hidden="true">
      {rows.map(row => (
        <div key={row.id} className={`aadhunika-row ${row.dir}`}>
          {row.words.map(j => (
            <span key={j} className="aadhunika-word">{WORD}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ══ ECG line ══ */
const ECGLine = () => {
  const seg = 'M0,13 L20,13 L24,3 L28,23 L32,3 L36,23 L40,13 L65,13';
  return (
    <div className="ecg-line" aria-hidden="true">
      <svg viewBox="0 0 260 26" preserveAspectRatio="none">
        <path d={`${seg} ${seg}`} fill="none"
          stroke="#14b8a6" strokeWidth="1.2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ══ 3D tilt — passive event, capped at 8deg ══ */
function use3DTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
        el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        el.style.boxShadow = `${-x * 2}px ${-y * 2}px 40px rgba(20,184,166,0.12), 0 40px 80px rgba(0,0,0,0.7)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
      el.style.boxShadow = '';
    };
    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function UnifiedLogin() {
  const router  = useRouter();
  const cardRef = useRef(null);

  const [role, setRole]       = useState('admin');
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const [step, setStep]       = useState('login');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass,  setAdminPass]  = useState('');

  const [departments,  setDepartments]  = useState([]);
  const [dept,         setDept]         = useState('');
  const [identifier,   setIdentifier]   = useState('');
  const [docPass,      setDocPass]      = useState('');
  const [showPass,     setShowPass]     = useState(false);

  const [fpEmail,       setFpEmail]       = useState('');
  const [otp,           setOtp]           = useState('');
  const [newPass,       setNewPass]       = useState('');
  const [confirmNewPass,setConfirmNewPass]= useState('');

  use3DTilt(cardRef);

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const switchRole    = (r) => { setRole(r); setStep('login'); };
  const triggerShake  = () => { setShake(true); setTimeout(() => setShake(false), 400); };

  const handleAdminLogin = (e) => {
    e.preventDefault(); setLoading(true);
    if (adminEmail === 'admin@gmail.com' && adminPass === 'admin123') {
      toast.success('Welcome back, Admin! 👋');
      setTimeout(() => router.push('/admin/dashboard'), 900);
    } else {
      toast.error('Invalid credentials');
      setLoading(false); triggerShake();
    }
  };

  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    if (!dept)              return toast.error('Select a department');
    if (!identifier.trim()) return toast.error('Enter email or phone');
    if (!docPass)           return toast.error('Enter password');
    setLoading(true);
    try {
      const res  = await fetch('/api/doctor-auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: docPass, dept }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`doctorSession_${data.doctor._id}`, JSON.stringify(data.doctor));
        toast.success(`Welcome, ${data.doctor.name}! 👋`);
        setTimeout(() => router.push(`/doctor/dashboard?id=${data.doctor._id}`), 800);
      } else { toast.error(data.error || 'Login failed'); triggerShake(); }
    } catch { toast.error('Network error'); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!fpEmail.trim()) return toast.error('Enter email');
    setLoading(true);
    try {
      const res  = await fetch('/api/doctor-auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('OTP sent!'); setStep('otp'); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setStep('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6)        return toast.error('Min 6 characters');
    if (newPass !== confirmNewPass) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res  = await fetch('/api/doctor-auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successfully!'); setStep('login');
        setFpEmail(''); setOtp(''); setNewPass(''); setConfirmNewPass('');
      } else toast.error(data.error || 'Reset failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const stepLabel = {
    login:  role === 'admin' ? 'Sign in to admin dashboard' : 'Sign in to your doctor account',
    forgot: 'Enter your registered email',
    otp:    `OTP sent to ${fpEmail}`,
    reset:  'Set your new password',
  };

  return (
    <div className="login-container">
      <div className="grid-floor" />
      <AadhunikaBackground />

      <div
        ref={cardRef}
        className={`login-card ${shake ? 'shake' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="card-header-strip" />

        <div className="login-icon">
          {role === 'admin' ? '🏥' : '👨‍⚕️'}
        </div>

        <h1 className="login-title">
          {role === 'admin' ? 'Admin Portal' : 'Doctor Portal'}
        </h1>
        <p className="login-subtitle">{stepLabel[step]}</p>

        {/* Role Toggle */}
        {step === 'login' && (
          <div className="role-toggle">
            <button className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => switchRole('admin')} type="button">🏥 Admin</button>
            <button className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => switchRole('doctor')} type="button">👨‍⚕️ Doctor</button>
            <div className={`toggle-slider ${role === 'doctor' ? 'right' : ''}`} />
          </div>
        )}

        {/* ── Admin ── */}
        {role === 'admin' && step === 'login' && (
          <form onSubmit={handleAdminLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" className="form-input" placeholder="admin@hospital.com"
                  value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                  disabled={loading} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" className="form-input" placeholder="Enter password"
                  value={adminPass} onChange={e => setAdminPass(e.target.value)}
                  disabled={loading} required />
              </div>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Logging in...</> : '🚀 Enter Dashboard'}
            </button>
          </form>
        )}

        {/* ── Doctor ── */}
        {role === 'doctor' && step === 'login' && (
          <form onSubmit={handleDoctorLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Department</label>
              <div className="input-wrapper">
                <span className="input-icon">🏥</span>
                <select className="form-input select-input" value={dept}
                  onChange={e => setDept(e.target.value)} required>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email or Phone</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="text" className="form-input" placeholder="Registered email or phone"
                  value={identifier} onChange={e => setIdentifier(e.target.value)}
                  disabled={loading} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Your password" value={docPass}
                  onChange={e => setDocPass(e.target.value)} disabled={loading}
                  required style={{ paddingRight: 44 }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="button" className="forgot-link" onClick={() => setStep('forgot')}>
              Forgot password?
            </button>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Signing in...</> : '🚀 Sign In'}
            </button>
          </form>
        )}

        {/* ── Forgot ── */}
        {step === 'forgot' && (
          <form onSubmit={handleSendOTP} className="login-form">
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" className="form-input" placeholder="doctor@hospital.com"
                  value={fpEmail} onChange={e => setFpEmail(e.target.value)} required />
              </div>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Sending...</> : '📧 Send OTP'}
            </button>
            <button type="button" className="back-link" onClick={() => setStep('login')}>
              ← Back to Login
            </button>
          </form>
        )}

        {/* ── OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="otp-info-box">
              <p>📧 OTP sent to <strong>{fpEmail}</strong></p>
              <p className="otp-validity">Valid for 10 minutes</p>
            </div>
            <div className="form-group">
              <label className="form-label">Enter 6-digit OTP</label>
              <input type="text" className="form-input otp-input" placeholder="• • • • • •"
                maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <button className="login-btn" type="submit">✅ Verify OTP</button>
            <button type="button" className="back-link"
              onClick={handleSendOTP} disabled={loading}>🔄 Resend OTP</button>
          </form>
        )}

        {/* ── Reset ── */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" className="form-input" placeholder="Min 6 characters"
                  value={newPass} onChange={e => setNewPass(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" className="form-input" placeholder="Re-enter password"
                  value={confirmNewPass} onChange={e => setConfirmNewPass(e.target.value)}
                  required style={{
                    borderColor: confirmNewPass && newPass !== confirmNewPass ? '#f87171' : ''
                  }} />
              </div>
              {confirmNewPass && newPass !== confirmNewPass &&
                <p className="error-text">Passwords do not match</p>}
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Resetting...</> : '🔐 Reset Password'}
            </button>
          </form>
        )}

        <ECGLine />
      </div>
    </div>
  );
}
