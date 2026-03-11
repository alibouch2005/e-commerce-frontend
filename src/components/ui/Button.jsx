import clsx from "clsx";

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
    "rounded-md font-medium transition flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100",
    danger:
      "bg-red-500 text-white hover:bg-red-600"
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3"
  };

  return (

    <button
      disabled={disabled || loading}
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >

      {loading && (
        <span className="animate-spin">
          ⏳
        </span>
      )}

      {children}

    </button>

  );
}