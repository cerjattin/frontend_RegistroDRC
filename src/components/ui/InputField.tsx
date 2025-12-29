import React from "react";

type Props = {
  label: string;
  icon: string;
  name: string;
  placeholder?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "placeholder">;

export default function InputField({
  label,
  icon,
  name,
  placeholder,
  className,
  ...inputProps
}: Props) {
  return (
    <label className="flex flex-col">
      <span className="text-sm font-medium text-[#0F1A13] mb-2">{label}</span>

      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#54926D] text-[20px]">
          {icon}
        </span>

        <input
          {...inputProps}
          name={name}
          placeholder={placeholder}
          className={[
            `
            w-full h-12 md:h-14
            rounded-xl border border-[#D2E5D9]
            bg-white/70
            pl-11 pr-4
            text-[#0F1A13] placeholder:text-[#54926D]/60
            focus:outline-none focus:ring-2 focus:ring-[#7A00D2]/20 focus:border-[#7A00D2]
            transition
          `,
            className || "",
          ].join(" ")}
        />
      </div>
    </label>
  );
}
