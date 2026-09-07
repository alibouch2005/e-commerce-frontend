export default function ProductPagination({ page, lastPage, setPage, meta, perPage, setPerPage, t }) {
  const safeLastPage = Math.max(Number(lastPage || 1), 1);
  const safePage = Math.min(Math.max(Number(page || 1), 1), safeLastPage);

  if (safeLastPage <= 1) return null;

  const pages = Array.from({ length: safeLastPage }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === safeLastPage || Math.abs(p - safePage) <= 2);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(Number(nextPage || 1), 1), safeLastPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center text-sm font-bold text-gray-500 sm:text-left">
        {t("productsRange", { from: meta?.from || 0, to: meta?.to || 0, total: meta?.total || 0 })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <select
          value={perPage}
          onChange={(event) => {
            setPerPage(Number(event.target.value));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600"
        >
          {[12, 24, 48].map((value) => (
            <option key={value} value={value}>{t("perPage", { count: value })}</option>
          ))}
        </select>

        <button
          disabled={safePage === 1}
          onClick={() => goToPage(1)}
          className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
        >
          «
        </button>

        <button
          disabled={safePage === 1}
          onClick={() => goToPage(safePage - 1)}
          className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
        >
          {t("previous")}
        </button>

        {pages.map((p, index) => {
          const previous = pages[index - 1];
          const showDots = previous && p - previous > 1;

          return (
            <span key={p} className="flex items-center gap-1">
              {showDots && <span className="px-1 text-gray-300">...</span>}
              <button
                onClick={() => goToPage(p)}
                className={`flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl font-bold transition-all ${
                  safePage === p
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          disabled={safePage === safeLastPage}
          onClick={() => goToPage(safePage + 1)}
          className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
        >
          {t("next")}
        </button>

        <button
          disabled={safePage === safeLastPage}
          onClick={() => goToPage(safeLastPage)}
          className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
        >
          »
        </button>
      </div>
    </nav>
  );
}
