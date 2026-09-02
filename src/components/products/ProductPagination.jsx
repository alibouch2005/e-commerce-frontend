export default function ProductPagination({ page, lastPage, setPage, meta, perPage, setPerPage, t }) {
  if (lastPage <= 1) return null; //c est pour ne pas afficher la pagination si il n y a qu une page
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter((p, index, allPages) => p === 1 || p === allPages.length || Math.abs(p - page) <= 2);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), lastPage));
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
            goToPage(1);
          }}
          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600"
        >
          {[12, 24, 48].map((value) => (
            <option key={value} value={value}>{t("perPage", { count: value })}</option>
          ))}
        </select>
      <button
        disabled={page === 1}
        onClick={() => goToPage(1)}
        className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
      >
        «
      </button>
      <button
        disabled={page === 1}
        onClick={() => goToPage(page - 1)}
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
              className={`flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl font-bold transition-all
                ${
                  page === p
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
        disabled={page === lastPage}
        onClick={() => goToPage(page + 1)}
        className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
      >
        {t("next")}
      </button>
      <button
        disabled={page === lastPage}
        onClick={() => goToPage(lastPage)}
        className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-gray-500 disabled:opacity-30"
      >
        »
      </button>
      </div>
    </nav>
  );
}
