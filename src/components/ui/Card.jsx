import clsx from "clsx";

export default function Card({
  children,
  variant = "default",
  padding = "md",
  shadow = "md",
  className = "",
}) {

  const baseStyle =
    "rounded-2xl border bg-white/95 transition-all duration-300 dark:bg-gray-900/95";

  const variants = {
    default: "border-gray-200/80 dark:border-gray-800",
    outline: "border-gray-300 dark:border-gray-700",
    elevated: "border-white/70 dark:border-gray-800"
  };

  const paddings = {
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-[0_12px_35px_-24px_rgba(15,23,42,.45)]",
    lg: "shadow-[0_22px_60px_-30px_rgba(15,23,42,.55)]"
  };

  return (

    <div
      className={clsx(
        baseStyle,
        variants[variant],
        paddings[padding],
        shadows[shadow],
        className
      )}
    >

      {children}

    </div>

  );

}
