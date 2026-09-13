import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  variant = "default",
  size = "md",
  error,
  className = "",
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const baseStyle =
    "w-full rounded-xl border bg-white outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-4 dark:bg-gray-900";

  const variants = {
    default: "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-gray-700 dark:focus:border-indigo-400",
    filled: "border-transparent bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-100 dark:bg-gray-800 dark:focus:bg-gray-900",
    danger: "border-red-400 focus:border-red-500 focus:ring-red-100",
  };

  const sizes = {
    sm: "min-h-10 px-3 py-2 text-sm",
    md: "min-h-12 px-4 py-3 text-base",
    lg: "min-h-14 px-5 py-4 text-lg",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={isPassword && passwordVisible ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          className={clsx(
            baseStyle,
            variants[error ? "danger" : variant],
            sizes[size],
            isPassword && "pr-12",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-800"
            aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            title={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-sm font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
