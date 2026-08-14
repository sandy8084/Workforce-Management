import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../utils/auth';
import { Users, Package, CalendarDays, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

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
        setPendingUser(user);
        setShowChangePassword(true);
        setLoading(false);
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

  const handlePasswordChanged = (updatedUser) => {
    setShowChangePassword(false);
    if (updatedUser.role === 'HR') navigate('/hr-dashboard');
    else if (updatedUser.role === 'ITADMIN') navigate('/it-dashboard');
    else navigate('/employee-dashboard');
  };


  return (
    <div className="login-screen">
      <style>{css}</style>

      {/* illustrated background scene */}
      <div className="mesh-bg">
        <div className="grid-overlay" />

        {/* concentric rings cluster, bottom-right */}
        <div className="rings-wrap">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="ring-core" />
          <div className="cog cog-a" />
          <div className="cog cog-b" />
        </div>

        {/* robot mascot + plant, bottom-left */}
        <div className="mascot-wrap">
          <div className="mascot-shadow" />
          <div className="mascot-antenna">
            <span className="antenna-bulb" />
          </div>
          <div className="mascot-body">
            <span className="mascot-eye eye-l" />
            <span className="mascot-eye eye-r" />
            <span className="mascot-smile" />
            <span className="mascot-panel" />
          </div>
          <span className="mascot-arm arm-l" />
          <span className="mascot-arm arm-r" />
        </div>
        <div className="plant-wrap">
          <span className="leaf leaf-1" />
          <span className="leaf leaf-2" />
          <span className="leaf leaf-3" />
          <span className="pot" />
        </div>

        {/* floating particles */}
        <span className="particle p1" />
        <span className="particle p2" />
        <span className="particle p3" />
        <span className="particle p4" />
        <span className="particle p5" />
        <span className="particle p6" />

        <FloatIcon Icon={Users} label="Employee Dashboard" hint="Profiles, roles & departments in one view" style={{ top: '12%', left: '10%' }} delay="0s" tooltipSide="right" />
        <FloatIcon Icon={Package} label="Asset Tracking" hint="Assign & monitor IT inventory" style={{ top: '46%', left: '8%' }} delay="1.4s" tooltipSide="right" />
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
            style={{ background: `radial-gradient(340px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,200,0,0.28), transparent 70%)` }}
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
      {showChangePassword && (
        <ChangePasswordModal user={pendingUser} onSuccess={handlePasswordChanged} />
      )}
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

html, body {
  margin: 0;
  height: 100%;
}
.login-screen {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0B2A38;
  font-family: 'Inter', sans-serif;
}

/* ---- ambient background ---- */
.mesh-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(174,198,209,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(174,198,209,0.06) 1px, transparent 1px);
  background-size: 42px 42px;
}

/* ---- concentric rings cluster ---- */
.rings-wrap {
  position: absolute;
  bottom: -220px;
  right: -200px;
  width: 560px;
  height: 560px;
  z-index: 0;
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border-style: solid;
}
.ring-1 { border-width: 2px; border-color: rgba(174,198,209,0.3); animation: spinSlow 60s linear infinite; }
.ring-2 { inset: 60px; border-width: 2px; border-color: rgba(92,127,147,0.4); animation: spinSlow 46s linear infinite reverse; }
.ring-3 { inset: 130px; border-width: 2px; border-color: rgba(255,200,0,0.35); animation: spinSlow 34s linear infinite; }
.ring-core {
  position: absolute;
  inset: 210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,200,0,0.28), transparent 72%);
  animation: pulseCore 4s ease-in-out infinite;
}
@keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulseCore { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }

.cog {
  position: absolute;
  border-radius: 50%;
  border-style: dashed;
  box-sizing: border-box;
}
.cog-a {
  width: 74px; height: 74px;
  top: 40px; left: 30px;
  border-width: 9px;
  border-color: rgba(255,200,0,0.55);
  background: rgba(11,42,56,0.4);
  animation: spinSlow 14s linear infinite;
}
.cog-b {
  width: 46px; height: 46px;
  bottom: 90px; left: -10px;
  border-width: 7px;
  border-color: rgba(174,198,209,0.6);
  background: rgba(11,42,56,0.4);
  animation: spinSlow 10s linear infinite reverse;
}

/* ---- robot mascot ---- */
.mascot-wrap {
  position: absolute;
  bottom: 9%;
  left: 5%;
  z-index: 1;
  animation: mascotBob 4.2s ease-in-out infinite;
}
.mascot-shadow {
  width: 78px; height: 14px;
  border-radius: 50%;
  background: rgba(0,0,0,0.35);
  filter: blur(4px);
  margin: 0 auto;
  transform: translateY(4px);
}
.mascot-antenna {
  position: absolute;
  top: -30px; left: 50%;
  width: 3px; height: 26px;
  background: rgba(174,198,209,0.8);
  transform-origin: bottom center;
  animation: antennaSway 2.6s ease-in-out infinite;
}
.antenna-bulb {
  position: absolute;
  top: -7px; left: 50%;
  transform: translateX(-50%);
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #FFF200;
  box-shadow: 0 0 10px rgba(255,242,0,0.8);
  animation: blinkGlow 1.6s ease-in-out infinite;
}
.mascot-body {
  position: relative;
  width: 86px; height: 96px;
  border-radius: 40px 40px 46px 46px;
  background: linear-gradient(160deg, #FFC800, #E0A800);
  box-shadow: 0 16px 26px rgba(0,0,0,0.4);
}
.mascot-eye {
  position: absolute;
  top: 34px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #0B2A38;
  animation: blink 4.5s ease-in-out infinite;
}
.eye-l { left: 26px; }
.eye-r { right: 26px; }
.mascot-smile {
  position: absolute;
  top: 52px; left: 50%;
  transform: translateX(-50%);
  width: 22px; height: 11px;
  border-bottom: 3px solid #0B2A38;
  border-radius: 0 0 14px 14px;
}
.mascot-panel {
  position: absolute;
  bottom: 12px; left: 50%;
  transform: translateX(-50%);
  width: 40px; height: 20px;
  border-radius: 6px;
  background: rgba(11,42,56,0.18);
}
.mascot-arm {
  position: absolute;
  top: 46px;
  width: 10px; height: 30px;
  border-radius: 6px;
  background: #5C7F93;
}
.arm-l { left: -6px; transform-origin: top center; }
.arm-r { right: -6px; transform-origin: top center; animation: wave 3.2s ease-in-out infinite; }
@keyframes mascotBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes antennaSway { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes blinkGlow { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.15); } }
@keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-24deg); } 50% { transform: rotate(6deg); } 75% { transform: rotate(-14deg); } }

/* ---- plant ---- */
.plant-wrap {
  position: absolute;
  bottom: 8%;
  left: 17%;
  z-index: 1;
  animation: sway 5s ease-in-out infinite;
  transform-origin: bottom center;
}
.pot {
  display: block;
  width: 40px; height: 34px;
  background: linear-gradient(160deg, #AEC6D1, #8fa9b5);
  border-radius: 8px 8px 16px 16px;
  box-shadow: 0 12px 18px rgba(0,0,0,0.3);
}
.leaf {
  position: absolute;
  bottom: 30px;
  width: 9px; height: 30px;
  border-radius: 50% 50% 50% 0;
}
.leaf-1 { left: 4px; background: #5C7F93; transform: rotate(-20deg); }
.leaf-2 { left: 15px; background: #FFC800; height: 36px; transform: rotate(2deg); }
.leaf-3 { left: 26px; background: #5C7F93; transform: rotate(22deg); }
@keyframes sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

/* ---- floating particles ---- */
.particle {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
  animation: particleFloat 7s ease-in-out infinite;
}
.p1 { width: 10px; height: 10px; background: rgba(255,200,0,0.7); top: 18%; left: 30%; animation-duration: 6s; }
.p2 { width: 7px; height: 7px; background: rgba(174,198,209,0.7); top: 62%; left: 40%; animation-duration: 8s; animation-delay: 1s; }
.p3 { width: 8px; height: 8px; border: 2px solid rgba(255,242,0,0.6); background: transparent; top: 30%; right: 32%; animation-duration: 7s; animation-delay: 0.5s; }
.p4 { width: 12px; height: 12px; border: 2px solid rgba(92,127,147,0.55); background: transparent; top: 78%; right: 40%; animation-duration: 9s; animation-delay: 1.6s; }
.p5 { width: 6px; height: 6px; background: rgba(255,200,0,0.55); top: 46%; left: 6%; animation-duration: 6.5s; animation-delay: 0.8s; }
.p6 { width: 9px; height: 9px; background: rgba(174,198,209,0.5); top: 12%; right: 22%; animation-duration: 7.5s; animation-delay: 1.2s; }
@keyframes particleFloat {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
  50% { transform: translateY(-22px) translateX(8px); opacity: 1; }
}

.float-icon-wrap {
  position: absolute;
  z-index: 3;
}
.float-icon {
  position: relative;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(245,249,250,0.92);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  color: #0B2A38;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  animation: iconBob 6s ease-in-out infinite;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  outline: none;
}
.float-icon:hover,
.float-icon:focus-visible {
  background: #F5F9FA;
  box-shadow: 0 12px 30px rgba(0,0,0,0.45);
  transform: scale(1.08);
  animation-play-state: paused;
}
@keyframes iconBob {
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
  background: #0B2A38;
  border: 1px solid rgba(174,198,209,0.25);
  box-shadow: 0 12px 28px rgba(0,0,0,0.4);
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
  background: rgba(255,200,0,0.22);
  color: #FFC800;
  display: flex; align-items: center; justify-content: center;
}
.icon-tooltip-text { display: flex; flex-direction: column; gap: 1px; }
.icon-tooltip-text strong { font-size: 12.5px; font-weight: 600; color: #F5F9FA; }
.icon-tooltip-text em { font-size: 11px; font-style: normal; color: #AEC6D1; }
.icon-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px; height: 8px;
  background: #0B2A38;
  border-left: 1px solid rgba(174,198,209,0.25);
  border-bottom: 1px solid rgba(174,198,209,0.25);
  transform: translateY(-50%) rotate(45deg);
}
.tooltip-right::after { left: -5px; }
.tooltip-left::after { right: -5px; transform: translateY(-50%) rotate(225deg); }

/* ---- center content ---- */
.center-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  max-height: 100vh;
}

.brand-row {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.brand-mark {
  position: relative;
  width: 46px; height: 46px; border-radius: 13px;
  background: #2AA79B;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Sora', sans-serif;
  font-weight: 700; font-size: 19px; color: #FFFFFF;
  box-shadow: 0 10px 24px rgba(0,0,0,0.45);
}
.halo {
  position: absolute;
  inset: -6px;
  border-radius: 16px;
  border: 1.5px solid rgba(255,200,0,0.45);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  70% { transform: scale(1.25); opacity: 0; }
  100% { opacity: 0; }
}
.brand-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; color: #F5F9FA; }
.brand-sub { font-size: 11.5px; color: #AEC6D1; }

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
  padding: 28px 34px 24px;
  border-radius: 25px;
  background: rgba(245,249,250,0.92);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.7);
}
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  color: #3d5768;
  background: rgba(92,127,147,0.15);
  padding: 5px 11px;
  border-radius: 999px;
  margin-bottom: 12px;
}
.headline {
  font-family: 'Sora', sans-serif;
  font-size: 24px; font-weight: 700;
  color: #0B2A38;
  margin: 0 0 4px;
  background: linear-gradient(135deg, #0B2A38, #5C7F93);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subline { font-size: 13px; color: #5C7F93; margin: 0 0 18px; }

/* ---- floating-label fields ---- */
.field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #dde6ea;
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 12px 14px 0;
  height: 48px;
  margin-bottom: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field.focused {
  border-color: #FFC800;
  box-shadow: 0 0 0 4px rgba(255,200,0,0.18);
}
.field-icon { color: #9db0ba; transition: color 0.2s; flex-shrink: 0; }
.field.focused .field-icon { color: #c99900; }
.field label {
  position: absolute;
  left: 40px;
  top: 14px;
  font-size: 14px;
  color: #9db0ba;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), color 0.18s;
}
.field.active label {
  transform: translateY(-9px) scale(0.76);
  color: #3d5768;
  font-weight: 600;
}
.field input {
  border: none; outline: none; background: transparent;
  flex: 1; font-size: 14px; padding-top: 8px; align-self: flex-end;
  padding-bottom: 8px; color: #0B2A38;
}
.field-trailing { display: flex; align-items: center; }
.eye-btn { border: none; background: transparent; cursor: pointer; color: #9db0ba; display: flex; padding: 0; }
.eye-btn:hover { color: #3d5768; }

.forgot-row { text-align: right; margin-bottom: 14px; margin-top: -2px; }
.forgot-link { font-size: 12.5px; color: #5C7F93; text-decoration: none; font-weight: 500; transition: opacity 0.15s; }
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
  background: linear-gradient(135deg, #FFC800, #E0A800);
  color: #0B2A38;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 26px rgba(255,200,0,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(255,200,0,0.5);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { cursor: not-allowed; opacity: 0.85; }
.btn-label { display: flex; align-items: center; gap: 8px; transition: opacity 0.15s; }
.btn-shimmer {
  position: absolute;
  top: 0; left: -60%;
  width: 40%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
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
  border: 2.5px solid rgba(11,42,56,0.35);
  border-top-color: #0B2A38;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- footer ---- */
.footer-row {
  display: flex; align-items: center; gap: 12px;
  margin-top: 16px;
}
.footer-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: #AEC6D1; font-weight: 500;
}
.dot-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(174,198,209,0.4); }

/* ---- entrance animations ---- */
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-down { opacity: 0; animation: fadeInDown 0.6s ease forwards; }
.fade-in-up { opacity: 0; animation: fadeInUp 0.65s ease forwards; animation-delay: 0.12s; }

@media (prefers-reduced-motion: reduce) {
  .float-icon, .halo, .btn-shimmer, .spinner, .shake, .fade-in-down, .fade-in-up,
  .ring, .ring-core, .cog, .mascot-wrap, .mascot-antenna, .antenna-bulb, .mascot-eye,
  .arm-r, .plant-wrap, .particle {
    animation: none !important;
    opacity: 1 !important;
  }
}

@media (max-width: 1100px) {
  .float-icon-wrap { display: none; }
}
@media (max-width: 900px) {
  .rings-wrap, .mascot-wrap, .plant-wrap, .particle { display: none; }
}
@media (max-height: 700px) {
  .brand-row { margin-bottom: 10px; }
  .card { padding: 20px 30px 18px; }
  .field { height: 44px; margin-bottom: 10px; }
  .footer-row { margin-top: 10px; }
}

@media (max-width: 480px) {
  .card { padding: 32px 22px 28px; }
}
`;

export default Login;