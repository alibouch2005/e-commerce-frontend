import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductSearch({ setSearch, initialValue = "" }) {
  const input = useRef(null);
  const timer = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    clearTimeout(timer.current);
    if (input.current) input.current.value = initialValue;
  }, [initialValue]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    clearTimeout(timer.current);
    // Only a user edit starts a search; URL changes must not reset pagination.
    timer.current = setTimeout(() => setSearch(nextValue), 350);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
      <input
        type="search"
        aria-label={t("searchProducts")}
        placeholder={t("searchProducts")}
        ref={input}
        defaultValue={initialValue}
        onChange={handleChange}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 pl-12 text-base font-semibold outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900"
      />
    </div>
  );
}
