import type { ChangeEvent } from "react";

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
  required = false,
}: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400"
      />
    </label>
  );
}
