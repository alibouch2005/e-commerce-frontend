import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({ page, lastPage, setPage, meta, perPage, setPerPage, t }) {
  const safeLastPage = Math.max(Number(lastPage || 1), 1);
  const safePage = Math.min(Math.max(Number(page || 1), 1), safeLastPage);

  if (safeLastPage <= 1) return null;

  const pages = Array.from({ length: safeLastPage }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === safeLastPage || Math.abs(item - safePage) <= 2);

  const goToPage = (nextPage) => {
    const resolvedPage = Math.min(Math.max(Number(nextPage || 1), 1), safeLastPage);
    if (resolvedPage === safePage) return;
    setPage(resolvedPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination des produits" className="w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
      <p className="text-center text-sm font-bold text-gray-500 sm:text-left">
        {t("productsRange", { from: meta?.from || 0, to: meta?.to || 0, total: meta?.total || 0 })}
      </p>

      <div className="mt-3 flex min-w-0 flex-col-reverse gap-2 sm:mt-0 sm:flex-row sm:items-center">
        <select
          aria-label="Produits par page"
          value={perPage}
          onChange={(event) => {
            setPerPage(Number(event.target.value));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-center text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto sm:shrink-0 sm:bg-white"
        >
          {[12, 24, 48].map((value) => <option key={value} value={value}>{t("perPage", { count: value })}</option>)}
        </select>

        <div className="flex min-w-0 items-center justify-between gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1 sm:justify-center sm:bg-transparent sm:p-0">
          <PaginationButton disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} ariaLabel={t("previous")} icon={<ChevronLeft size={17} />} />
          {pages.map((item, index) => {
            const previous = pages[index - 1];
            const showDots = previous && item - previous > 1;
            return (
              <span key={item} className="flex shrink-0 items-center gap-1">
                {showDots && <span className="px-1 text-gray-300">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-label={String(item)}
                  aria-current={safePage === item ? "page" : undefined}
                  className={`grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-black transition-all ${safePage === item ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-gray-500 hover:text-indigo-600"}`}
                >
                  {item}
                </button>
              </span>
            );
          })}
          <PaginationButton disabled={safePage === safeLastPage} onClick={() => goToPage(safePage + 1)} ariaLabel={t("next")} icon={<ChevronRight size={17} />} />
        </div>
      </div>
    </nav>
  );
}

function PaginationButton({ disabled, onClick, ariaLabel, icon }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={ariaLabel} className="grid h-10 min-w-10 shrink-0 place-items-center rounded-xl bg-white px-2 text-gray-500 transition hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-30">
      {icon}
    </button>
  );
}
