export function Table({ columns, rows, loading, emptyText = "Không có dữ liệu" }) {
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
              <td colSpan={columns.length}>Đang tải dữ liệu...</td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          )}
          {!loading &&
            rows.map((row, index) => (
              <tr key={row._id || row.id || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
