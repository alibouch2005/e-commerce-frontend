import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductSearch({ setSearch, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, setSearch]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
      <input
        type="search"
        placeholder={t("searchProducts")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 pl-12 text-base font-semibold outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900"
      />
    </div>
  );
}
