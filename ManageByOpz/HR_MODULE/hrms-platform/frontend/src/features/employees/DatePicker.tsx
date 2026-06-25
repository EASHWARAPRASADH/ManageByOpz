import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const parseLocalDate = (str: string) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
};

const formatLocalDate = (date: Date | null) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function DatePicker({ value, onChange, label, required = false }: DatePickerProps) {
  const selectedDate = parseLocalDate(value);

  return (
    <div className="space-y-1 w-full text-left">
      {label && (
        <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <Calendar className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
        <ReactDatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => onChange(formatLocalDate(date))}
          dateFormat="yyyy-MM-dd"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-slate-900 dark:text-white outline-none border-none cursor-pointer font-semibold"
          placeholderText="YYYY-MM-DD"
        />
      </div>
    </div>
  );
}
