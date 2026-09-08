const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function PaginationControls({
  page,
  pageSize,
  totalCount,
  loading,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotalCount = Number.isFinite(totalCount) ? Math.max(0, Math.trunc(totalCount)) : 0;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.trunc(pageSize) : 20;
  const totalPages = Math.max(1, Math.ceil(safeTotalCount / safePageSize));
  const requestedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
  const safePage = Math.min(Math.max(1, requestedPage), totalPages);
  const rangeStart = safeTotalCount === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const rangeEnd = safeTotalCount === 0 ? 0 : Math.min(safePage * safePageSize, safeTotalCount);
  const hasPrevious = safePage > 1;
  const hasNext = safePage < totalPages;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginTop: 18,
        color: "#9ca3af",
        fontSize: 14,
      }}
    >
      <div>
        Показано {rangeStart}–{rangeEnd} из {safeTotalCount}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          На странице
          <select
            value={safePageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
            style={{
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "8px 10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        <span>
          Страница {safePage} из {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!hasPrevious || loading}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "8px 12px",
            background: "#0f172a",
            color: "#e6eef8",
            cursor: !hasPrevious || loading ? "not-allowed" : "pointer",
            opacity: !hasPrevious || loading ? 0.6 : 1,
          }}
        >
          Предыдущая
        </button>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!hasNext || loading}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "8px 12px",
            background: "#0f172a",
            color: "#e6eef8",
            cursor: !hasNext || loading ? "not-allowed" : "pointer",
            opacity: !hasNext || loading ? 0.6 : 1,
          }}
        >
          Следующая
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
