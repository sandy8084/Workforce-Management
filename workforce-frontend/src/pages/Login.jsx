import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../utils/auth';
import { Users, Package, CalendarDays, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      saveAuth(token, user);

      if (user.must_change_password) {
        navigate('/change-password');
        return;
      }

      if (user.role === 'HR') navigate('/hr-dashboard');
      else if (user.role === 'ITADMIN') navigate('/it-dashboard');
      else navigate('/employee-dashboard');

    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <style>{css}</style>

      {/* ambient mesh background */}
      <div className="mesh-bg">
        <div className="mesh-blob mb-1" />
        <div className="mesh-blob mb-2" />
        <div className="mesh-blob mb-3" />
        <div className="grid-overlay" />
        <FloatIcon Icon={Users} label="Employee Dashboard" hint="Profiles, roles & departments in one view" style={{ top: '12%', left: '10%' }} delay="0s" tooltipSide="right" />
        <FloatIcon Icon={Package} label="Asset Tracking" hint="Assign & monitor IT inventory" style={{ top: '70%', left: '8%' }} delay="1.4s" tooltipSide="right" />
        <FloatIcon Icon={CalendarDays} label="Leave & Payroll" hint="Approvals and pay cycles, synced" style={{ top: '18%', right: '9%' }} delay="0.7s" tooltipSide="left" />
        <FloatIcon Icon={ShieldCheck} label="Data Privacy" hint="Your data is encrypted end-to-end" style={{ top: '72%', right: '11%' }} delay="2.1s" tooltipSide="left" />
      </div>

      {/* centered content */}
      <div className="center-wrap">
        <div className="brand-row fade-in-down">
          <div className="brand-mark">
            <span className="halo" />
            W
          </div>
          <div>
            <div className="brand-title">WORKFORCE</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>

        <div
          className="card-wrap fade-in-up"
          ref={cardRef}
          onMouseMove={handleMouseMove}
        >
          <div
            className="glow"
            style={{ background: `radial-gradient(340px circle at ${spotlight.x}% ${spotlight.y}%, rgba(47,168,144,0.35), transparent 70%)` }}
          />
          <div className="card">
            <div className="pill">
              <Lock size={12} />
              Secure sign in
            </div>

            <h1 className="headline">Welcome back</h1>
            <p className="subline">Sign in to your workspace to continue</p>

            <form onSubmit={handleLogin}>
              <Field
                label="Email address"
                icon={<Mail size={16} />}
                type="email"
                value={email}
                onChange={setEmail}
                focused={focusedField === 'email'}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />

              <Field
                label="Password"
                icon={<Lock size={16} />}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                focused={focusedField === 'password'}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                trailing={
                  <button
                    type="button"
                    className="eye-btn"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div className="forgot-row">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              {error && <p className="error-text shake">{error}</p>}

              <button type="submit" className="submit-btn" disabled={loading}>
                <span className="btn-shimmer" />
                <span className="btn-label" style={{ opacity: loading ? 0 : 1 }}>
                  Sign In <ArrowRight size={16} />
                </span>
                {loading && <span className="spinner" />}
              </button>
            </form>
          </div>
        </div>

        <div className="footer-row fade-in-up" style={{ animationDelay: '0.35s' }}>
          <FooterBadge icon={<Users size={14} />} label="Employees" />
          <span className="dot-sep" />
          <FooterBadge icon={<Package size={14} />} label="Assets" />
          <span className="dot-sep" />
          <FooterBadge icon={<CalendarDays size={14} />} label="Leave & payroll" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, type, value, onChange, focused, onFocus, onBlur, trailing }) {
  const active = focused || value.length > 0;
  return (
    <div className={`field ${active ? 'active' : ''} ${focused ? 'focused' : ''}`}>
      <span className="field-icon">{icon}</span>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        required
      />
      {trailing && <span className="field-trailing">{trailing}</span>}
    </div>
  );
}

function FloatIcon({ Icon, label, hint, style, delay, tooltipSide = 'right' }) {
  return (
    <div className="float-icon-wrap" style={style}>
      <div className="float-icon" style={{ animationDelay: delay }} tabIndex={0}>
        <Icon size={20} />
        <div className={`icon-tooltip tooltip-${tooltipSide}`}>
          <span className="icon-tooltip-icon"><Icon size={14} /></span>
          <span className="icon-tooltip-text">
            <strong>{label}</strong>
            <em>{hint}</em>
          </span>
        </div>
      </div>
    </div>
  );
}

function FooterBadge({ icon, label }) {
  return (
    <span className="footer-badge">
      {icon} {label}
    </span>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

.login-screen {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f3fbf7;
  font-family: 'Inter', sans-serif;
}

/* ---- mesh background ---- */
.mesh-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.mesh-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.55;
  animation: drift 16s ease-in-out infinite;
}
.mb-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, #8fe3ba, transparent 70%);
  top: -160px; left: -120px;
  animation-duration: 18s;
}
.mb-2 {
  width: 460px; height: 460px;
  background: radial-gradient(circle, #2FA890, transparent 70%);
  bottom: -180px; right: -100px;
  animation-duration: 22s;
  animation-delay: -6s;
}
.mb-3 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, #c9f3de, transparent 70%);
  top: 40%; right: 20%;
  animation-duration: 14s;
  animation-delay: -3s;
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 25px) scale(0.95); }
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15,61,52,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15,61,52,0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 40%, black, transparent 75%);
}
.float-icon-wrap {
  position: absolute;
  z-index: 3;
}
.float-icon {
  position: relative;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  color: #16302B;
  box-shadow: 0 8px 24px rgba(15,61,52,0.1);
  animation: bob 6s ease-in-out infinite;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  outline: none;
}
.float-icon:hover,
.float-icon:focus-visible {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 12px 30px rgba(15,61,52,0.2);
  transform: scale(1.08);
  animation-play-state: paused;
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-16px) rotate(6deg); }
}

/* ---- icon hover tooltips ---- */
.icon-tooltip {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 12px;
  background: rgba(15, 42, 36, 0.94);
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 28px rgba(15,61,52,0.25);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-50%) scale(0.92);
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
  pointer-events: none;
  z-index: 5;
}
.float-icon:hover .icon-tooltip,
.float-icon:focus-visible .icon-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) scale(1);
}
.tooltip-right { left: calc(100% + 14px); }
.tooltip-left { right: calc(100% + 14px); }
.icon-tooltip-icon {
  flex-shrink: 0;
  width: 24px; height: 24px;
  border-radius: 7px;
  background: rgba(47,168,144,0.25);
  color: #7fe0b4;
  display: flex; align-items: center; justify-content: center;
}
.icon-tooltip-text { display: flex; flex-direction: column; gap: 1px; }
.icon-tooltip-text strong { font-size: 12.5px; font-weight: 600; color: #ffffff; }
.icon-tooltip-text em { font-size: 11px; font-style: normal; color: #a9c9bf; }
/* small arrow */
.icon-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px; height: 8px;
  background: rgba(15, 42, 36, 0.94);
  transform: translateY(-50%) rotate(45deg);
}
.tooltip-right::after { left: -4px; }
.tooltip-left::after { right: -4px; }

/* ---- center content ---- */
.center-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
}

.brand-row {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 28px;
}
.brand-mark {
  position: relative;
  width: 46px; height: 46px; border-radius: 13px;
  background: linear-gradient(135deg, #2FA890, #16302B);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Sora', sans-serif;
  font-weight: 700; font-size: 19px; color: white;
  box-shadow: 0 10px 24px rgba(22,48,43,0.28);
}
.halo {
  position: absolute;
  inset: -6px;
  border-radius: 16px;
  border: 1.5px solid rgba(47,168,144,0.5);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  70% { transform: scale(1.25); opacity: 0; }
  100% { opacity: 0; }
}
.brand-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; color: #0f3d34; }
.brand-sub { font-size: 11.5px; color: #4f7d70; }

/* ---- card ---- */
.card-wrap {
  position: relative;
  border-radius: 26px;
  padding: 1px;
}
.glow {
  position: absolute;
  inset: 0;
  border-radius: 26px;
  pointer-events: none;
  transition: background 0.15s ease;
  z-index: 0;
}
.card {
  position: relative;
  z-index: 1;
  width: 380px;
  max-width: 90vw;
  padding: 40px 36px 34px;
  border-radius: 25px;
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 24px 60px rgba(15,61,52,0.14), inset 0 1px 0 rgba(255,255,255,0.6);
}
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  color: #1f7a68;
  background: rgba(47,168,144,0.12);
  padding: 5px 11px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.headline {
  font-family: 'Sora', sans-serif;
  font-size: 26px; font-weight: 700;
  color: #0f2a24;
  margin: 0 0 6px;
  background: linear-gradient(135deg, #0f2a24, #1f7a68);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subline { font-size: 13.5px; color: #64857b; margin: 0 0 26px; }

/* ---- floating-label fields ---- */
.field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #e1efe9;
  background: rgba(255,255,255,0.75);
  border-radius: 12px;
  padding: 14px 14px 0;
  height: 54px;
  margin-bottom: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field.focused {
  border-color: #2FA890;
  box-shadow: 0 0 0 4px rgba(47,168,144,0.12);
}
.field-icon { color: #94a3b8; transition: color 0.2s; flex-shrink: 0; }
.field.focused .field-icon { color: #2FA890; }
.field label {
  position: absolute;
  left: 40px;
  top: 17px;
  font-size: 14px;
  color: #94a3b8;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), color 0.18s;
}
.field.active label {
  transform: translateY(-9px) scale(0.76);
  color: #1f7a68;
  font-weight: 600;
}
.field input {
  border: none; outline: none; background: transparent;
  flex: 1; font-size: 14px; padding-top: 8px; align-self: flex-end;
  padding-bottom: 8px; color: #0f2a24;
}
.field-trailing { display: flex; align-items: center; }
.eye-btn { border: none; background: transparent; cursor: pointer; color: #94a3b8; display: flex; padding: 0; }
.eye-btn:hover { color: #1f7a68; }

.forgot-row { text-align: right; margin-bottom: 18px; margin-top: -4px; }
.forgot-link { font-size: 12.5px; color: #1f7a68; text-decoration: none; font-weight: 500; transition: opacity 0.15s; }
.forgot-link:hover { opacity: 0.65; }

.error-text {
  margin: 0 0 14px;
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #fecaca;
}
.shake { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ---- submit button ---- */
.submit-btn {
  position: relative;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2FA890, #1f7a68);
  color: white;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 26px rgba(47,168,144,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(47,168,144,0.45);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { cursor: not-allowed; opacity: 0.85; }
.btn-label { display: flex; align-items: center; gap: 8px; transition: opacity 0.15s; }
.btn-shimmer {
  position: absolute;
  top: 0; left: -60%;
  width: 40%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
  transform: skewX(-20deg);
  animation: shimmer 2.6s ease-in-out infinite;
}
@keyframes shimmer {
  0% { left: -60%; }
  50% { left: 130%; }
  100% { left: 130%; }
}
.spinner {
  position: absolute;
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- footer ---- */
.footer-row {
  display: flex; align-items: center; gap: 12px;
  margin-top: 26px;
}
.footer-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: #4f7d70; font-weight: 500;
}
.dot-sep { width: 3px; height: 3px; border-radius: 50%; background: #bcd8cd; }

/* ---- entrance animations ---- */
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-down { opacity: 0; animation: fadeInDown 0.6s ease forwards; }
.fade-in-up { opacity: 0; animation: fadeInUp 0.65s ease forwards; animation-delay: 0.12s; }

@media (prefers-reduced-motion: reduce) {
  .mesh-blob, .float-icon, .halo, .btn-shimmer, .spinner, .shake, .fade-in-down, .fade-in-up {
    animation: none !important;
    opacity: 1 !important;
  }
}

@media (max-width: 480px) {
  .float-icon { display: none; }
  .card { padding: 32px 22px 28px; }
}
`;

export default Login;