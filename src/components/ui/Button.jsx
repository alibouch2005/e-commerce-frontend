import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-xl font-black shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.98]";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200 disabled:bg-gray-300",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    outline: "border border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-200 disabled:bg-gray-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200 disabled:bg-gray-300",
  };

  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm",
    md: "min-h-12 px-5 py-3 text-base",
    lg: "min-h-14 px-6 py-4 text-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-70",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
