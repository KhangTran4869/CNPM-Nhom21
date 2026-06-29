import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { api } from "../services/api";
import { errorText, formatDate, toDateInput } from "../utils/format";

const emptyForm = {
  name: "",
  start_date: "",
  end_date: "",
  status: "PLANNING",
};

const toForm = (semester) => ({
  name: semester?.name || "",
  start_date: toDateInput(semester?.start_date),
  end_date: toDateInput(semester?.end_date),
  status: semester?.status || "PLANNING",
});

const statusLabels = {
  PLANNING: { text: "Đang lập kế hoạch", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  UPCOMING: { text: "Chưa mở", color: "#475569", bg: "#f8fafc", border: "#cbd5e1" },
  ACTIVE: { text: "Đang diễn ra", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  COMPLETED: { text: "Đã kết thúc", color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
  LOCKED: { text: "Đã khóa", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

export function SemestersPage() {
  const { filteredRows, keyword, setKeyword, loading, error, setError, load } = useResourceList("/semesters", {
    searchKeys: ["name"],
  });
  const [modal, setModal] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setError("");
    setSelectedSemester(null);
    setForm(emptyForm);
    setModal("Thêm học kỳ");
  };

  const openEdit = (semester) => {
    setError("");
    setSelectedSemester(semester);
    setForm(toForm(semester));
    setModal("Sửa học kỳ");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.start_date || !form.end_date) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
      return;
    }
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (start >= end) {
      setError("Ngày kết thúc học kỳ phải sau ngày bắt đầu");
      return;
    }
    if (!selectedSemester) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end < today) {
        setError("Không thể tạo học kỳ có ngày kết thúc nằm trong quá khứ");
        return;
      }
    }
    try {
      if (selectedSemester) {
        await api.put(`/semesters/${selectedSemester._id}`, form);
      } else {
        await api.post("/semesters", form);
      }
      setModal("");
      setSelectedSemester(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.payload?.errors?.map((item) => item.message || item).join(", ") || err.message || "Không thể lưu học kỳ");
    }
  };

  const remove = async (semester) => {
    if (window.confirm(`Xóa học kỳ ${semester.name}?`)) {
      await api.delete(`/semesters/${semester._id}`);
      load();
    }
  };

  const columns = [
    { key: "name", title: "Tên học kỳ" },
    { key: "start_date", title: "Ngày bắt đầu", render: (row) => formatDate(row.start_date) },
    { key: "end_date", title: "Ngày kết thúc", render: (row) => formatDate(row.end_date) },
    {
      key: "status",
      title: "Trạng thái",
      render: (row) => {
        const cfg = statusLabels[row.status] || statusLabels.PLANNING;
        return (
          <span style={{
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "600",
            color: cfg.color,
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: "inline-block"
          }}>
            {cfg.text}
          </span>
        );
      }
    },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          <Button variant="outline" onClick={() => openEdit(row)}>Sửa</Button>
          <Button variant="danger" onClick={() => remove(row)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Quản lý học kỳ"
        actions={
          <div className="row-actions">
            <Button onClick={openCreate}>Thêm mới</Button>
            <Button variant="outline" onClick={() => load()}>Làm mới</Button>
          </div>
        }
      >
        <div className="filter-row">
          <Input label="Tìm kiếm" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        {error && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={filteredRows} loading={loading} />
      </Card>

      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Tên học kỳ" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Ngày bắt đầu" type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required />
          <Input label="Ngày kết thúc" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required />
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px", color: "#334155" }}>Trạng thái học kỳ</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#fff" }}
            >
              <option value="PLANNING">Đang lập kế hoạch (Chỉ cho phép 1 học kỳ)</option>
              <option value="UPCOMING">Chưa mở</option>
              <option value="ACTIVE">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc (Khóa chạy thuật toán)</option>
              <option value="LOCKED">Đã khóa (Khóa sửa đổi phân công)</option>
            </select>
          </div>
          {error && <div className="alert danger" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <Button className="form-submit" type="submit" style={{ gridColumn: "1 / -1" }}>Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
