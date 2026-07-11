import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormFieldProps = {
  label: string;
  type?: string;
  placeholder: string;
  name?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export function FormField({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  required,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-950 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}
