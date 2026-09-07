import React, { useState, useEffect } from 'react';
import { X, Check, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { formatBaht } from '../constants/categories';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (newBudget: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSave,
}) => {
  const [budgetStr, setBudgetStr] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBudgetStr(String(currentBudget || 15000));
      setError(null);
    }
  }, [isOpen, currentBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetStr);
    if (isNaN(val) || val < 0) {
      setError('กรุณาระบุจำนวนงบประมาณที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(val);
      onClose();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="budget-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              ตั้งงบประมาณรายจ่ายรายเดือน
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            ระบบจะใช้ตัวเลขนี้ในการคำนวณและแสดงแถบความคืบหน้าแจ้งเตือนการใช้จ่ายของคุณในแต่ละเดือน
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณรายจ่ายต่อเดือน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                id="input-monthly-budget"
                type="number"
                min="0"
                step="500"
                required
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 mt-2.5">
              {[10000, 15000, 20000, 30000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBudgetStr(String(preset))}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  {formatBaht(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btn-save-budget"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>บันทึกงบประมาณ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
