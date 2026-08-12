import { useState } from 'react';
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
  const navigate = useNavigate();

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

      {/* ambient background */}
      <div className="bg-layer">
        <span className="blob blob-tl" />
        <span className="blob blob-br" />
        <span className="blob blob-cream" />
        <div className="dot-grid" />
      </div>

      {/* floating feature icons */}
      <FloatIcon
        Icon={Users}
        label="Employee Directory"
        hint="Profiles, roles & departments in one view"
        className="fi-tl"
        tone="teal"
        delay="0s"
        tooltipSide="right"
      />
      <FloatIcon
        Icon={Package}
        label="Asset Tracking"
        hint="Assign & monitor IT inventory"
        className="fi-bl"
        tone="teal"
        delay="1.4s"
        tooltipSide="right"
      />
      <FloatIcon
        Icon={CalendarDays}
        label="Leave & Payroll"
        hint="Approvals and pay cycles, synced"
        className="fi-tr"
        tone="amber"
        delay="0.7s"
        tooltipSide="left"
      />
      <FloatIcon
        Icon={ShieldCheck}
        label="Role-Based Access"
        hint="Every route guarded by your role"
        className="fi-br"
        tone="teal"
        delay="2.1s"
        tooltipSide="left"
      />

      <div className="center-wrap">
        {/* brand */}
        <div className="brand-row fade-in-down">
          <div className="brand-mark">W</div>
          <div className="brand-text">
            <div className="brand-title">WORKFORCE</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>

        {/* card */}
        <div className="card fade-in-up">
          <div className="pill">
            <Lock size={13} />
            Secure sign in
          </div>

          <h1 className="headline">
            Welcome <span>back</span>
          </h1>
          <p className="subline">Sign in to your workspace to continue</p>

          <form onSubmit={handleLogin}>
            <Field
              icon={<Mail size={19} />}
              placeholder="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              focused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />

            <Field
              icon={<Lock size={19} />}
              placeholder="Password"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="forgot-row">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            {error && <p className="error-text shake">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              <span className="btn-label" style={{ opacity: loading ? 0 : 1 }}>
                Sign In <ArrowRight size={18} />
              </span>
              {loading && <span className="spinner" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type, value, onChange, focused, onFocus, onBlur, trailing }) {
  return (
    <div className={`field ${focused ? 'focused' : ''}`}>
      <span className="field-icon">{icon}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        required
      />
      {trailing && <span className="field-trailing">{trailing}</span>}
    </div>
  );
}

function FloatIcon({ Icon, label, hint, className, tone, delay, tooltipSide }) {
  return (
    <div className={`float-icon-wrap ${className}`}>
      <div
        className={`float-icon tone-${tone}`}
        style={{ animationDelay: delay }}
        tabIndex={0}
        role="button"
        aria-label={`${label}: ${hint}`}
      >
        <Icon size={26} strokeWidth={1.9} />
        <div className={`icon-tooltip tooltip-${tooltipSide}`}>
          <span className="icon-tooltip-icon"><Icon size={15} /></span>
          <span className="icon-tooltip-text">
            <strong>{label}</strong>
            <em>{hint}</em>
          </span>
        </div>
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.login-screen {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  background: #F1F4F5;
  font-family: 'Inter', sans-serif;
  padding: clamp(16px, 3.5vh, 40px) 20px;
  box-sizing: border-box;
}

/* ---------- background ---------- */
.bg-layer { position: absolute; inset: 0; overflow: hidden; z-index: 0; }

.blob { position: absolute; border-radius: 50%; }
.blob-tl {
  width: 620px; height: 620px;
  top: -330px; left: -230px;
  background: #DCEBE6;
  opacity: 0.85;
}
.blob-br {
  width: 720px; height: 720px;
  bottom: -300px; right: -180px;
  background: #CFE2DE;
  opacity: 0.8;
}
.blob-cream {
  width: 460px; height: 460px;
  bottom: -230px; left: 46%;
  background: #FAF2E2;
  opacity: 0.9;
}
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(15, 61, 52, 0.10) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.55;
}

/* ---------- floating icons ---------- */
.float-icon-wrap { position: absolute; z-index: 3; }
.fi-tl { top: 12%; left: 7%; }
.fi-bl { top: 76%; left: 7%; }
.fi-tr { top: 18%; right: 8%; }
.fi-br { top: 78%; right: 7%; }

.float-icon {
  position: relative;
  width: 74px; height: 74px;
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 34px rgba(15, 61, 52, 0.10);
  animation: bob 10s ease-in-out infinite;
  cursor: pointer;
  outline: none;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.tone-teal { background: #E7F3EF; color: #0E7C6B; }
.tone-amber { background: #FDF4E1; color: #E0A32C; }

.float-icon:hover,
.float-icon:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 22px 44px rgba(15, 61, 52, 0.16);
  animation-play-state: paused;
}
.float-icon:focus-visible { box-shadow: 0 0 0 3px rgba(14, 124, 107, 0.35), 0 22px 44px rgba(15, 61, 52, 0.16); }

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ---------- hover tooltips ---------- */
.icon-tooltip {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-radius: 15px;
  background: #0F2A24;
  box-shadow: 0 18px 40px rgba(15, 61, 52, 0.24);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-50%) scale(0.92);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  pointer-events: none;
  z-index: 5;
}
.float-icon:hover .icon-tooltip,
.float-icon:focus-visible .icon-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) scale(1);
}
.tooltip-right { left: calc(100% + 16px); }
.tooltip-left { right: calc(100% + 16px); }

.icon-tooltip-icon {
  flex-shrink: 0;
  width: 28px; height: 28px;
  border-radius: 10px;
  background: rgba(47, 168, 144, 0.20);
  color: #7FE0C4;
  display: flex; align-items: center; justify-content: center;
}
.icon-tooltip-text { display: flex; flex-direction: column; gap: 3px; }
.icon-tooltip-text strong { font-size: 13px; font-weight: 700; color: #ffffff; font-family: 'Outfit', sans-serif; }
.icon-tooltip-text em { font-size: 11.5px; font-style: normal; color: #A9C6BD; }

.icon-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 10px; height: 10px;
  background: #0F2A24;
  transform: translateY(-50%) rotate(45deg);
}
.tooltip-right::after { left: -5px; }
.tooltip-left::after { right: -5px; }

/* ---------- centre column ---------- */
.center-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* ---------- brand ---------- */
.brand-row {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: clamp(16px, 3vh, 32px);
}
.brand-mark {
  width: clamp(50px, 6.4vh, 62px);
  height: clamp(50px, 6.4vh, 62px);
  border-radius: 19px;
  background: linear-gradient(150deg, #23B49C 0%, #0B6255 100%);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700; font-size: clamp(23px, 3vh, 28px); color: #ffffff;
  box-shadow: 0 16px 32px rgba(11, 98, 85, 0.26);
}
.brand-text { display: flex; flex-direction: column; gap: 2px; }
.brand-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(21px, 2.7vh, 26px); font-weight: 700; letter-spacing: 0.6px;
  color: #0C2A28; line-height: 1.1;
}
.brand-sub { font-size: clamp(13px, 1.7vh, 15.5px); color: #6B8681; font-weight: 400; }

/* ---------- card ---------- */
.card {
  width: 100%;
  max-width: 460px;
  padding: clamp(26px, 3.8vh, 40px) clamp(24px, 3.2vw, 42px) clamp(28px, 4vh, 44px);
  border-radius: clamp(22px, 3vh, 30px);
  background: #ffffff;
  box-shadow: 0 34px 70px rgba(15, 61, 52, 0.10);
  box-sizing: border-box;
}
.pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: clamp(11.5px, 1.5vh, 13px); font-weight: 600;
  color: #0E7C6B;
  background: #E7F3EF;
  padding: clamp(7px, 1vh, 9px) 15px;
  border-radius: 999px;
  margin-bottom: clamp(14px, 2.4vh, 24px);
}
.headline {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(27px, 4vh, 35px); font-weight: 700;
  color: #0C1F1D;
  margin: 0 0 clamp(6px, 1vh, 10px);
  letter-spacing: -0.5px;
}
.headline span { color: #0E7C6B; }
.subline { font-size: clamp(13.5px, 1.8vh, 15.5px); color: #7A8F8B; margin: 0 0 clamp(18px, 3vh, 30px); }

/* ---------- fields ---------- */
.field {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #E6ECEA;
  background: #ffffff;
  border-radius: 15px;
  padding: 0 17px;
  height: clamp(50px, 6.6vh, 60px);
  margin-bottom: clamp(11px, 1.9vh, 17px);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field.focused {
  border-color: #0E7C6B;
  box-shadow: 0 0 0 4px rgba(14, 124, 107, 0.10);
}
.field-icon { color: #0E7C6B; display: flex; flex-shrink: 0; }
.field input {
  border: none; outline: none; background: transparent;
  flex: 1; height: 100%;
  font-size: clamp(14px, 1.8vh, 15.5px); color: #0C1F1D;
  font-family: 'Inter', sans-serif;
}
.field input::placeholder { color: #9AAAA6; }
.field-trailing { display: flex; align-items: center; }
.eye-btn { border: none; background: transparent; cursor: pointer; color: #9AAAA6; display: flex; padding: 0; }
.eye-btn:hover { color: #0E7C6B; }

.forgot-row { text-align: right; margin-bottom: clamp(14px, 2.4vh, 22px); margin-top: -2px; }
.forgot-link { font-size: clamp(12.5px, 1.7vh, 14px); color: #0E7C6B; text-decoration: none; font-weight: 600; transition: opacity 0.15s; }
.forgot-link:hover { opacity: 0.68; }

.error-text {
  margin: 0 0 clamp(12px, 2vh, 18px);
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  padding: 11px 14px;
  border-radius: 12px;
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

/* ---------- submit ---------- */
.submit-btn {
  position: relative;
  width: 100%;
  height: clamp(50px, 6.8vh, 60px);
  border: none;
  border-radius: 15px;
  background: #087A6B;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(15px, 2vh, 17px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 30px rgba(8, 122, 107, 0.24);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.submit-btn:hover:not(:disabled) {
  background: #0A8B79;
  transform: translateY(-2px);
  box-shadow: 0 22px 38px rgba(8, 122, 107, 0.30);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { cursor: not-allowed; opacity: 0.78; }
.btn-label { display: flex; align-items: center; gap: 12px; transition: opacity 0.15s; }
.spinner {
  position: absolute;
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.45);
  border-top-color: rgba(255,255,255,0.95);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- entrance ---------- */
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-down { opacity: 0; animation: fadeInDown 0.6s ease forwards; }
.fade-in-up { opacity: 0; animation: fadeInUp 0.65s ease forwards; animation-delay: 0.12s; }

@media (prefers-reduced-motion: reduce) {
  .float-icon, .spinner, .shake, .fade-in-down, .fade-in-up {
    animation: none !important;
    opacity: 1 !important;
  }
}

/* very short windows: drop the brand block rather than force a scrollbar */
@media (max-height: 620px) {
  .brand-row { display: none; }
  .float-icon { width: 60px; height: 60px; border-radius: 20px; }
}

@media (max-width: 1180px) {
  .fi-tl, .fi-bl, .fi-tr, .fi-br { display: none; }
}

@media (max-width: 520px) {
  .card { padding: 32px 24px 34px; border-radius: 24px; }
  .headline { font-size: 30px; }
  .brand-mark { width: 56px; height: 56px; border-radius: 17px; font-size: 25px; }
  .brand-title { font-size: 23px; }
  .brand-sub { font-size: 14px; }
}
`;

export default Login;