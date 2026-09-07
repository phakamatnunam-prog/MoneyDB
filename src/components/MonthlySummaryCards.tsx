import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatBaht } from '../constants/categories';

interface MonthlySummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  monthlyBudget: number;
  transactionCount: number;
  onOpenBudgetModal: () => void;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  monthlyBudget,
  transactionCount,
  onOpenBudgetModal,
}) => {
  const netBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((netBalance / totalIncome) * 100)))
      : 0;

  const budgetUsedPct =
    monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;
  const isOverBudget = monthlyBudget > 0 && totalExpense > monthlyBudget;

  return (
    <div id="monthly-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatBaht(totalIncome)}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{transactionCount} รายการในเดือนนี้</span>
          <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
            รายได้เข้า
          </span>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-rose-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight">
            -{formatBaht(totalExpense)}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {monthlyBudget > 0
              ? `งบ: ${formatBaht(monthlyBudget)}`
              : 'ยังไม่ได้ตั้งงบ'}
          </span>
          <span
            className={`font-medium px-1.5 py-0.5 rounded ${
              isOverBudget
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {monthlyBudget > 0 ? `${budgetUsedPct}% ของงบ` : 'รายจ่ายออก'}
          </span>
        </div>
      </div>

      {/* 3. Net Savings */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">ยอดคงเหลือสุทธิ</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
            }`}
          >
            {netBalance >= 0 ? formatBaht(netBalance) : `-${formatBaht(Math.abs(netBalance))}`}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>อัตราการออม</span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded ${
              netBalance >= 0
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {savingsRate}%
          </span>
        </div>
      </div>

      {/* 4. Budget & Savings Health */}
      <div
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-200 transition-colors cursor-pointer"
        onClick={onOpenBudgetModal}
        title="คลิกเพื่อปรับเปลี่ยนงบประมาณ"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">สถานะงบประมาณ</span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        {monthlyBudget > 0 ? (
          <>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-800">
                ใช้ไป {budgetUsedPct}%
              </span>
              <span className="text-xs text-slate-400">
                เหลือ {formatBaht(Math.max(0, monthlyBudget - totalExpense))}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetUsedPct > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center gap-1 text-[11px]">
              {isOverBudget ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> เกินงบที่ตั้งไว้
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> อยู่ในเกณฑ์งบประมาณ
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="mt-3">
            <p className="text-xs text-slate-500">ยังไม่ได้กำหนดงบประมาณ</p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              + คลิกเพื่อตั้งงบประมาณ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
