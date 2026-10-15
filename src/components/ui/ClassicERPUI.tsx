import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { useDateFormat } from '../../utils/dateFormatter';

export const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export interface ClassicTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const ClassicTab: React.FC<ClassicTabProps> = ({ label, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "px-6 py-0.5 text-[10.5px] cursor-pointer border-t border-l border-r rounded-t-[2px] transition-all",
      isActive 
        ? "bg-white border-[#808080] font-bold -mb-[1px] relative z-10" 
        : "bg-[#f0f0f0] border-transparent hover:bg-white/50 text-[#444444]"
    )}
  >
    {label}
  </div>
);

export const ClassicInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={cn(
      "h-[18px] border border-[#d4d0c8] px-1 text-[10.5px] outline-none focus:border-orange-400 bg-white shadow-inner",
      props.className
    )}
  />
);

export interface ClassicDateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (isoDate: string) => void;
  wrapperClassName?: string;
}

/**
 * ClassicDateInput
 * Form input for dates that automatically respects the global system date format
 * (from Administration -> General Settings -> Display -> Date Format).
 * Displays dates formatted per system settings, and emits ISO YYYY-MM-DD on change.
 */
export const ClassicDateInput: React.FC<ClassicDateInputProps> = ({
  value,
  onChange,
  onValueChange,
  className,
  wrapperClassName,
  placeholder,
  disabled,
  ...rest
}) => {
  const { dateFormat, placeholder: defaultPlaceholder, formatDate, parseToIso } = useDateFormat();

  const formattedValue = useMemo(() => {
    return value ? formatDate(value, '') : '';
  }, [value, dateFormat, formatDate]);

  const [text, setText] = useState(formattedValue);

  useEffect(() => {
    setText(formattedValue);
  }, [formattedValue]);

  const hiddenPickerRef = useRef<HTMLInputElement>(null);

  const emitIso = (isoDate: string) => {
    onValueChange?.(isoDate);
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: rest.name || '',
          value: isoDate,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    if (!raw.trim()) {
      emitIso('');
      return;
    }
    const iso = parseToIso(raw);
    if (iso) {
      emitIso(iso);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    rest.onBlur?.(e);
    if (!text.trim()) {
      emitIso('');
      return;
    }
    const iso = parseToIso(text);
    if (iso) {
      setText(formatDate(iso, ''));
      emitIso(iso);
    } else {
      setText(formattedValue);
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    setText(iso ? formatDate(iso, '') : '');
    emitIso(iso);
  };

  const openPicker = () => {
    if (disabled) return;
    try {
      hiddenPickerRef.current?.showPicker();
    } catch {
      hiddenPickerRef.current?.focus();
    }
  };

  return (
    <div className={cn("relative inline-flex items-center", wrapperClassName || "w-full")}>
      <input
        type="text"
        value={text}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder || defaultPlaceholder}
        className={cn(
          "h-[18px] border border-[#d4d0c8] px-1 pr-5 text-[10.5px] outline-none focus:border-orange-400 bg-white shadow-inner w-full disabled:bg-gray-100",
          className
        )}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        disabled={disabled}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 disabled:opacity-40 p-0.5 cursor-pointer flex items-center justify-center"
        title={`Pick date (${defaultPlaceholder})`}
      >
        <Calendar className="w-3 h-3" />
      </button>
      <input
        ref={hiddenPickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value ? String(value).slice(0, 10) : ''}
        onChange={handleNativePickerChange}
        className="sr-only pointer-events-none absolute opacity-0"
      />
    </div>
  );
};

export const ClassicSel: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select 
    {...props}
    className={cn(
      "h-[18px] border border-[#d4d0c8] px-0.5 text-[10.5px] outline-none focus:border-orange-400 bg-white",
      props.className
    )}
  >
    {props.children}
  </select>
);

export const YellowBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button 
    {...props}
    className={cn(
      "bg-[#ffed99] hover:bg-[#ffe44d] border border-[#f39c12] text-[10.5px] px-3 py-1 rounded-[1px] font-bold text-gray-800 shadow-sm transition-colors",
      props.className
    )}
  >
    {props.children}
  </button>
);

export const GreyBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button 
    {...props}
    className={cn(
      "bg-[#f0f0f0] hover:bg-[#e0e0e0] border border-[#d4d0c8] text-[10.5px] px-3 py-1 rounded-[1px] text-gray-800 shadow-sm transition-colors",
      props.className
    )}
  >
    {props.children}
  </button>
);

export const FieldRow: React.FC<{ label: string; children: React.ReactNode; labelWidth?: string; required?: boolean }> = ({ label, children, labelWidth = "120px", required }) => (
  <div className="flex items-center gap-2 mb-1">
    <div style={{ width: labelWidth }} className="text-[10.5px] text-[#333] shrink-0">
      {label} {required && <span className="text-red-500">*</span>}
    </div>
    <div className="flex-1 flex items-center">
      {children}
    </div>
  </div>
);

export const ClassicTable: React.FC<{ headers: string[]; children?: React.ReactNode; rowCount?: number }> = ({ headers, children, rowCount = 10 }) => (
  <div className="border border-[#d4d0c8] overflow-auto bg-white flex-1 custom-scrollbar min-h-[150px]">
    <table className="w-full border-collapse">
      <thead className="sticky top-0 z-10">
        <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
          {headers.map((h, i) => (
            <th key={i} className="text-left py-1 px-2 border-r border-[#d4d0c8] text-[10.5px] font-bold text-[#444] whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
        {(!children || React.Children.count(children) === 0) && [...Array(rowCount)].map((_, i) => (
          <tr key={i} className={cn("border-b border-[#f0f0f0] h-[18px]", i % 2 === 0 ? "bg-white" : "bg-[#fafafa]")}>
            {headers.map((_, j) => (
              <td key={j} className="border-r border-[#f0f0f0] p-0"></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
