import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  pattern: RegExp;
  placeholder: string;
  format: (val: string) => string;
}

const COUNTRIES: CountryConfig[] = [
  {
    code: '+1',
    name: 'United States / Canada',
    flag: '🇺🇸',
    pattern: /^\d{10}$/,
    placeholder: '(555) 000-0000',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 10);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  },
  {
    code: '+91',
    name: 'India',
    flag: '🇮🇳',
    pattern: /^[6-9]\d{9}$/,
    placeholder: '98765 43210',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 10);
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
  },
  {
    code: '+44',
    name: 'United Kingdom',
    flag: '🇬🇧',
    pattern: /^7\d{9}$/,
    placeholder: '7123 456789',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 10);
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
  },
  {
    code: '+61',
    name: 'Australia',
    flag: '🇦🇺',
    pattern: /^4\d{8}$/,
    placeholder: '412 345 678',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 9);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  },
  {
    code: '+971',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    pattern: /^5\d{8}$/,
    placeholder: '50 123 4567',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 9);
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
  },
  {
    code: '+65',
    name: 'Singapore',
    flag: '🇸🇬',
    pattern: /^[89]\d{7}$/,
    placeholder: '8123 4567',
    format: (val: string) => {
      const digits = val.replace(/\D/g, '').slice(0, 8);
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
  }
];

// Fallback pattern for unsupported countries
const DEFAULT_COUNTRY = COUNTRIES[0];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  setError?: (err: string | null) => void;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  setError,
  required = false
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [touched, setTouched] = useState(false);

  // Parse initial value (e.g. "+91 98765 43210" or "+1 (555) 019-9231")
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }

    // Find if value starts with any of our country codes
    const foundCountry = COUNTRIES.find(c => value.startsWith(c.code));
    if (foundCountry) {
      setSelectedCountry(foundCountry);
      const rawNumber = value.slice(foundCountry.code.length).trim();
      setLocalNumber(foundCountry.format(rawNumber));
    } else {
      // Default to US/Canada +1 if no prefix match
      setSelectedCountry(DEFAULT_COUNTRY);
      setLocalNumber(DEFAULT_COUNTRY.format(value));
    }
  }, [value]);

  const handleCountrySelect = (country: CountryConfig) => {
    setSelectedCountry(country);
    setShowDropdown(false);

    // Format existing local number with new country format
    const formatted = country.format(localNumber);
    setLocalNumber(formatted);

    const rawDigits = formatted.replace(/\D/g, '');
    const fullVal = rawDigits ? `${country.code} ${formatted}` : '';
    onChange(fullVal);

    if (setError) {
      validate(rawDigits, country);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const formatted = selectedCountry.format(rawInput);
    setLocalNumber(formatted);

    const rawDigits = formatted.replace(/\D/g, '');
    const fullVal = rawDigits ? `${selectedCountry.code} ${formatted}` : '';
    onChange(fullVal);

    if (setError || touched) {
      validate(rawDigits, selectedCountry);
    }
  };

  const validate = (digits: string, country: CountryConfig) => {
    if (!digits) {
      if (required) {
        setError?.('Phone number is required');
      } else {
        setError?.(null);
      }
      return;
    }

    const isValid = country.pattern.test(digits);
    if (!isValid) {
      setError?.(`Invalid phone format for ${country.name}`);
    } else {
      setError?.(null);
    }
  };

  return (
    <div className="space-y-1 w-full text-left relative">
      {label && (
        <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-stretch rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        {/* Country Selector Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 px-3 border-r border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-l-lg transition-colors cursor-pointer shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <span className="text-base select-none">{selectedCountry.flag}</span>
          <span className="text-[10px] font-bold font-mono">{selectedCountry.code}</span>
        </button>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <Phone className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={localNumber}
            onChange={handleNumberChange}
            onBlur={() => {
              setTouched(true);
              validate(localNumber.replace(/\D/g, ''), selectedCountry);
            }}
            placeholder={selectedCountry.placeholder}
            className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-slate-900 dark:text-white outline-none border-none placeholder-slate-400 font-semibold"
          />
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute left-0 bottom-full mb-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-fade-in scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <div className="px-3 py-1.5 text-[9px] font-extrabold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
                Select Country
              </div>
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350"
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="font-mono text-[10px] font-bold text-indigo-500 w-10">{country.code}</span>
                  <span className="truncate flex-1">{country.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && touched && (
        <span className="text-[10px] font-bold text-rose-500 block animate-fade-in mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
