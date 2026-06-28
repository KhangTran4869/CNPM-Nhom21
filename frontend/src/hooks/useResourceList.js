import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { errorText } from "../utils/format";

const emptyParams = {};

const valueOf = (row, key) =>
  String(key.split(".").reduce((current, part) => current?.[part], row) || "").toLowerCase();

export function useResourceList(path, { searchKeys = [], initialParams = emptyParams } = {}) {
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(path, { ...initialParams, keyword, ...params });
        setRows(data);
        return data;
      } catch (err) {
        setRows([]);
        setError(errorText(err, "Không thể tải dữ liệu"));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [initialParams, keyword, path],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text || !searchKeys.length) return rows;
    return rows.filter((row) => searchKeys.some((key) => valueOf(row, key).includes(text)));
  }, [keyword, rows, searchKeys]);

  return {
    rows,
    setRows,
    filteredRows,
    keyword,
    setKeyword,
    loading,
    error,
    setError,
    load,
  };
}
