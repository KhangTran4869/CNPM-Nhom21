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
};

const toForm = (semester) => ({
  name: semester?.name || "",
  start_date: toDateInput(semester?.start_date),
  end_date: toDateInput(semester?.end_date),
});

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
      setError(errorText(err, "Không thể lưu học kỳ"));
    }
  };

  const remove = async (semester) => {
    if (!window.confirm(`Xóa học kỳ ${semester.name}?`)) return;
    setError("");
    try {
      await api.delete(`/semesters/${semester._id}`);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const columns = [
    { key: "name", title: "Tên học kỳ" },
    { key: "start_date", title: "Ngày bắt đầu", render: (row) => formatDate(row.start_date) },
    { key: "end_date", title: "Ngày kết thúc", render: (row) => formatDate(row.end_date) },
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
          <Input label="Ngày bắt đầu" type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
          <Input label="Ngày kết thúc" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
