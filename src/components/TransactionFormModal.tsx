import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, AlignLeft, Tag } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHOD_LABELS,
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    month: string;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
  initialData?: Transaction | null;
  defaultMonth?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultMonth,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmountStr(String(initialData.amount));
        setCategory(initialData.category);
        setDescription(initialData.description || '');
        setDate(initialData.date);
        setPaymentMethod(initialData.paymentMethod || 'transfer');
      } else {
        setType('expense');
        setAmountStr('');
        setCategory(EXPENSE_CATEGORIES[0].name);
        setDescription('');
        // Default date to today, or first day of defaultMonth
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setDate(todayStr);
        setPaymentMethod('transfer');
      }
      setError(null);
    }
  }, [isOpen, initialData, defaultMonth]);

  // When type changes, ensure selected category matches the type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      if (!EXPENSE_CATEGORIES.some((c) => c.name === category)) {
        setCategory(EXPENSE_CATEGORIES[0].name);
      }
    } else {
      if (!INCOME_CATEGORIES.some((c) => c.name === category)) {
        setCategory(INCOME_CATEGORIES[0].name);
      }
    }
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    const month = date.substring(0, 7); // YYYY-MM

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        type,
        amount,
        category,
        description: description.trim(),
        date,
        month,
        paymentMethod,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div
      id="transaction-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Type Toggle Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                id="input-tx-amount"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 text-2xl font-bold rounded-2xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                  type === 'expense'
                    ? 'text-rose-600 border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100'
                    : 'text-emerald-600 border-slate-200 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100'
                }`}
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {[50, 100, 300, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition shrink-0 cursor-pointer"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {activeCategories.map((c) => {
                const isSelected = category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : c.bgColor,
                        color: isSelected ? '#ffffff' : c.color,
                      }}
                    >
                      <CategoryIcon name={c.iconName} size={18} />
                    </div>
                    <span className="text-[11px] font-medium leading-tight line-clamp-2">
                      {c.name.split(' / ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ *
              </label>
              <input
                id="input-tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                ช่องทางการชำระ
              </label>
              <select
                id="select-tx-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                หมายเหตุ / รายละเอียดเพิ่มเติม (ไม่บังคับ)
              </span>
              <span className="text-[10px] text-slate-400">{description.length}/200</span>
            </label>
            <input
              id="input-tx-desc"
              type="text"
              maxLength={200}
              placeholder="เช่น ข้าวกลางวัน, กาแฟสด, โอนเงินแม่"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btn-submit-tx"
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{initialData ? 'อัปเดตรายการ' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
