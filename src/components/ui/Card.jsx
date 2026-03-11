import clsx from "clsx";

export default function Card({
  children,
  variant = "default",
  padding = "md",
  shadow = "md",
  className = "",
}) {

  const baseStyle =
    "rounded-lg border bg-white transition";

  const variants = {
    default: "border-gray-200",
    outline: "border-gray-300",
    elevated: "border-transparent"
  };

  const paddings = {
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg"
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