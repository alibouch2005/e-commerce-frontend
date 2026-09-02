import { useEffect, useState } from "react";
import { Grid2X2 } from "lucide-react";
import { getCategories } from "../../services/categoryService";
import { useLanguage } from "../../context/LanguageContext";

export default function CategoryFilter({ category, setCategory }) {
  const [categories, setCategories] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data ?? res.data.categories ?? res.data)).catch(() => setCategories([]));
  }, []);

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:gap-3">
      <button onClick={() => setCategory(null)} className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition sm:px-5 sm:text-xs ${category === null ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"}`}>
        <Grid2X2 size={15} /> {t("all")}
      </button>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => setCategory(cat.id)} className={`min-h-11 whitespace-nowrap rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition sm:px-5 sm:text-xs ${category === cat.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"}`}>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
