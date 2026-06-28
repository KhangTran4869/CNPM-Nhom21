import { useState, useEffect } from "react";

export function Table({ columns, rows = [], loading, emptyText = "Không có dữ liệu", defaultPageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [size, setSize] = useState(defaultPageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, size]);

  const totalPages = Math.ceil(rows.length / size) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * size;
  const displayRows = rows.slice(startIdx, startIdx + size);

  return (
    <div className="table-wrap">
      <table className="uis-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "24px" }}>
                Đang tải dữ liệu...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "24px" }}>
                {emptyText}
              </td>
            </tr>
          )}
          {!loading &&
            displayRows.map((row, index) => (
              <tr key={row._id || row.id || startIdx + index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row, startIdx + index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!loading && rows.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: "1px solid var(--border-color, #e5e7eb)",
            fontSize: "14px",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--card-bg, #ffffff)",
          }}
        >
          <div style={{ color: "var(--text-secondary)" }}>
            Hiển thị <strong>{startIdx + 1}</strong> - <strong>{Math.min(startIdx + size, rows.length)}</strong> trong tổng số <strong>{rows.length}</strong> dòng
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Hiển thị:</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid var(--border-color, #d1d5db)",
                backgroundColor: "var(--input-bg, #ffffff)",
                color: "var(--text-primary)",
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid var(--border-color, #d1d5db)",
                background: safePage <= 1 ? "var(--bg-secondary, #f3f4f6)" : "var(--card-bg, #fff)",
                color: safePage <= 1 ? "var(--text-tertiary, #9ca3af)" : "var(--text-primary)",
                cursor: safePage <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Trước
            </button>
            <span style={{ padding: "0 8px", fontWeight: "600", color: "var(--text-primary)" }}>
              Trang {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid var(--border-color, #d1d5db)",
                background: safePage >= totalPages ? "var(--bg-secondary, #f3f4f6)" : "var(--card-bg, #fff)",
                color: safePage >= totalPages ? "var(--text-tertiary, #9ca3af)" : "var(--text-primary)",
                cursor: safePage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
