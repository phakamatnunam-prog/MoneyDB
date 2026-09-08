import React, { useState } from 'react';
import {
  Database,
  TrendingUp,
  PieChart,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  signInGuest,
} from '../lib/firebase';
import pvcLogo from '../assets/images/pvc_logo_1788767410306.jpg';

interface AuthScreenProps {
  onSignInSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  // Tabs: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  // Parse Firebase auth errors into friendly Thai descriptions
  const parseAuthError = (err: any) => {
    const code = err?.code || '';
    setErrorCode(code);
    console.error('Firebase Auth Error:', code, err?.message);

    if (code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      setUnauthorizedDomain(domain);
      setErrorMsg(`โดเมน "${domain}" ยังไม่ได้รับอนุญาตใน Firebase Authentication`);
    } else if (code === 'auth/operation-not-allowed') {
      setErrorMsg(
        'วิธีเข้าสู่ระบบนี้ยังไม่ถูกเปิดใช้งานใน Firebase Console (กรุณาไปที่ Firebase Console > Authentication > Sign-in method แล้วเปิดใช้งาน Email/Password หรือ Google)'
      );
    } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      setErrorMsg('ไม่พบบัญชีนี้ หรือรหัสผ่านไม่ถูกต้อง (หากยังไม่เคยสร้างบัญชี กรุณากดแท็บ "สมัครสมาชิกใหม่")');
    } else if (code === 'auth/wrong-password') {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
    } else if (code === 'auth/email-already-in-use') {
      setErrorMsg('อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเลือกแท็บ "เข้าสู่ระบบ"');
    } else if (code === 'auth/weak-password') {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    } else if (code === 'auth/invalid-email') {
      setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบตัวสะกด เช่น name@example.com');
    } else if (code === 'auth/popup-blocked') {
      setErrorMsg('เบราว์เซอร์บล็อกหน้าต่างป็อปอัป กรุณาอนุญาตป็อปอัปในตั้งค่าเบราว์เซอร์');
    } else if (code === 'auth/popup-closed-by-user') {
      setErrorMsg(null);
    } else if (code === 'auth/network-request-failed') {
      setErrorMsg('การเชื่อมต่อขัดข้อง กรุณาตรวจสอบสัญญาณอินเทอร์เน็ต');
    } else {
      setErrorMsg(err?.message || 'การเข้าสู่ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  // 1. Handle Email & Password Login / Register
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setErrorCode(null);
      setUnauthorizedDomain(null);

      if (authMode === 'register') {
        await registerWithEmail(email, password, displayName.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      parseAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMsg(null);
      setErrorCode(null);
      setUnauthorizedDomain(null);
      await signInWithGoogle();
    } catch (err: any) {
      parseAuthError(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // 3. Handle Guest Login (Test / Demo)
  const handleGuestLogin = async () => {
    try {
      setGuestLoading(true);
      setErrorMsg(null);
      setErrorCode(null);
      setUnauthorizedDomain(null);
      await signInGuest();
    } catch (err: any) {
      parseAuthError(err);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-10"
    >
      <div className="w-full max-w-md">
        {/* College & App Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-md mb-3.5 bg-white p-1">
            <img
              src={pvcLogo}
              alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Money<span className="text-emerald-600">DB</span>
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            ระบบจัดการรายรับรายจ่าย พร้อมสรุปผลรายเดือนและกราฟวิเคราะห์ข้อมูล
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          {/* Tabs: เข้าสู่ระบบ / สมัครสมาชิก */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/80">
            <button
              id="tab-signin"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setErrorCode(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setErrorCode(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สมัครสมาชิกใหม่ (Register)
            </button>
          </div>

          {/* Alert Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-semibold text-red-900">{errorMsg}</p>

                  {/* Guide for unauthorized-domain */}
                  {unauthorizedDomain && (
                    <div className="text-[11px] text-slate-700 bg-white/90 p-2.5 rounded-lg border border-red-200/80 space-y-1">
                      <p className="font-semibold text-red-700">วิธีแก้ไข:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                        <li>
                          เปิด{' '}
                          <a
                            href="https://console.firebase.google.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 underline font-medium inline-flex items-center gap-0.5"
                          >
                            Firebase Console <ExternalLink className="w-2.5 h-2.5 inline" />
                          </a>
                        </li>
                        <li>เลือกโปรเจกต์ของคุณ ➜ <strong>Authentication</strong> ➜ แท็บ <strong>Settings</strong></li>
                        <li>เลื่อนไปที่ <strong>Authorized domains</strong> แล้วคลิก <strong>Add domain</strong></li>
                        <li>
                          กรอก:{' '}
                          <code className="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono font-bold select-all">
                            {unauthorizedDomain}
                          </code>
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Guide for operation-not-allowed */}
                  {errorCode === 'auth/operation-not-allowed' && (
                    <div className="text-[11px] text-slate-700 bg-white/90 p-2.5 rounded-lg border border-red-200/80 space-y-1">
                      <p className="font-semibold text-red-700">วิธีเปิดใช้งานใน Firebase Console:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                        <li>ไปที่ <strong>Authentication</strong> ➜ แท็บ <strong>Sign-in method</strong></li>
                        <li>คลิกที่ <strong>Email/Password</strong> แล้วกด <strong>Enable (เปิด)</strong> ➜ Save</li>
                        <li>คลิกที่ <strong>Google</strong> แล้วกด <strong>Enable (เปิด)</strong> ➜ Save</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ-นามสกุล หรือชื่อที่ต้องการแสดง
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="input-auth-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น user@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-email-auth"
              type="submit"
              disabled={loading || googleLoading || guestLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : authMode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>สร้างบัญชีผู้ใช้ใหม่</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-medium">หรือเข้าใช้งานด้วยวิธีอื่น</span>
            </div>
          </div>

          {/* Alternative Logins */}
          <div className="space-y-2.5">
            {/* Google Login */}
            <button
              id="btn-google-login"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading || guestLoading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-800 font-medium text-xs sm:text-sm transition shadow-2xs active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>เข้าสู่ระบบด้วย Google (Gmail)</span>
            </button>

            {/* Quick Guest / Demo Login */}
            <button
              id="btn-guest-login"
              type="button"
              onClick={handleGuestLogin}
              disabled={loading || googleLoading || guestLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 font-medium text-xs transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guestLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>เข้าทดลองใช้งานทันที (Guest / Demo Mode)</span>
            </button>
          </div>

          {/* Feature Highlight */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">จัดเก็บบน Firebase MoneyDB:</span> ข้อมูลปลอดภัย ซิงค์เรียลไทม์
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <PieChart className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">กราฟวิเคราะห์รายจ่าย:</span> สรุปแนวโน้มและหมวดหมู่การเงิน
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-xs text-slate-400">
          โปรเจกต์ฐานข้อมูล MoneyDB • ปลอดภัยด้วย Firebase Authentication
        </div>
      </div>
    </div>
  );
};
