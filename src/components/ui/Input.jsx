import clsx from "clsx";

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

  const baseStyle =
    "w-full rounded-md border outline-none transition";

  const variants = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
    filled: "bg-gray-100 border-transparent focus:bg-white focus:border-blue-500",
    danger: "border-red-500 focus:ring-red-200"
  };

  const sizes = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3"
  };

  return (

    <div className="flex flex-col gap-1">

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          baseStyle,
          variants[variant],
          sizes[size],
          error && "border-red-500",
          className
        )}
        {...props}
      />

      {error && (
        <span className="text-sm text-red-500">
          {error}
        </span>
      )}

    </div>

  );
}