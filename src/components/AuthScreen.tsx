import React, { useState } from 'react';
import {
  Database,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import pvcLogo from '../assets/images/pvc_logo_1788767410306.jpg';

interface AuthScreenProps {
  onSignInSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login failed:', err);
      // Popup closed by user or permission
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('การเข้าสู่ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-12"
    >
      <div className="w-full max-w-md">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-md mb-4 bg-white p-1">
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
          <p className="mt-1.5 text-sm font-semibold text-slate-700">
            วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ระบบจัดการรายรับรายจ่าย พร้อมสรุปผลรายเดือนและกราฟวิเคราะห์ข้อมูล
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Google / Gmail Sign In Button */}
          <button
            id="btn-google-login"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-800 font-medium text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Gmail'}</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center">
              จุดเด่นของระบบ MoneyDB
            </p>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">จัดเก็บบน Firebase MoneyDB</span>
                  <p className="text-slate-500">ข้อมูลปลอดภัย ซิงค์แบบเรียลไทม์ข้ามอุปกรณ์</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">กราฟวิเคราะห์รายจ่ายเชิงลึก</span>
                  <p className="text-slate-500">ดูกราฟสัดส่วนหมวดหมู่และแนวโน้มการเงินแม่นยำ</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">สรุปรายเดือน & อัตราเงินออม</span>
                  <p className="text-slate-500">ติดตามงบประมาณ วางแผนทางการเงินอย่างมีเป้าหมาย</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          โปรเจกต์ฐานข้อมูล MoneyDB • ปลอดภัยด้วย Firebase Authentication
        </div>
      </div>
    </div>
  );
};
