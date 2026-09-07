import React from 'react';
import { User } from 'firebase/auth';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  SlidersHorizontal,
  FileSpreadsheet,
  Database,
  Calendar,
} from 'lucide-react';
import { formatThaiMonth } from '../constants/categories';
import pvcLogo from '../assets/images/pvc_logo_1788767410306.jpg';

interface NavbarProps {
  user: User | null;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onExportCSV: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenBudgetModal,
  onExportCSV,
  onSignOut,
}) => {
  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(next);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(cur);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Project Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-white flex items-center justify-center p-0.5 ring-2 ring-emerald-500/20">
              <img
                src={pvcLogo}
                alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Money<span className="text-emerald-600">DB</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                วิทยาลัยอาชีวศึกษาแพร่ • ระบบจัดการรายรับรายจ่าย
              </p>
            </div>
          </div>

          {/* Month Navigator in Center */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-prev-month"
              type="button"
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 select-none">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
              <span>{formatThaiMonth(selectedMonth)}</span>
            </div>
            <button
              id="btn-next-month"
              type="button"
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="btn-today-month"
              type="button"
              onClick={handleCurrentMonth}
              className="ml-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:bg-white rounded-md transition-colors hidden md:inline-block cursor-pointer"
            >
              เดือนนี้
            </button>
          </div>

          {/* Right Action buttons & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-open-budget"
              type="button"
              onClick={onOpenBudgetModal}
              title="ตั้งงบประมาณประจำเดือน"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>งบประมาณ</span>
            </button>

            <button
              id="btn-export-csv"
              type="button"
              onClick={onExportCSV}
              title="ดาวน์โหลดเป็นไฟล์ CSV"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              id="btn-add-transaction-nav"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/30 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>บันทึกรายการ</span>
            </button>

            {/* User Profile Badge */}
            {user && (
              <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 gap-2">
                {user.photoURL ? (
                  <img
                    id="user-avatar-img"
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  type="button"
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
