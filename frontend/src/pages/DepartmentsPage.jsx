import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { api } from "../services/api";
import { errorText } from "../utils/format";

const emptyForm = {
  code: "",
  name: "",
  description: "",
};

const toForm = (department) => ({
  code: department?.code || "",
  name: department?.name || "",
  description: department?.description || "",
});

export function DepartmentsPage() {
  const { filteredRows, keyword, setKeyword, loading, error, setError, load } = useResourceList("/departments", {
    searchKeys: ["code", "name", "description"],
  });
  const [modal, setModal] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setError("");
    setSelectedDepartment(null);
    setForm(emptyForm);
    setModal("Thêm bộ môn");
  };

  const openEdit = (department) => {
    setError("");
    setSelectedDepartment(department);
    setForm(toForm(department));
    setModal("Sửa bộ môn");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (selectedDepartment) {
        await api.put(`/departments/${selectedDepartment._id}`, form);
      } else {
        await api.post("/departments", form);
      }
      setModal("");
      setSelectedDepartment(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(errorText(err, "Không thể lưu bộ môn"));
    }
  };

  const remove = async (department) => {
    if (!window.confirm(`Xóa bộ môn ${department.name}?`)) return;
    setError("");
    try {
      await api.delete(`/departments/${department._id}`);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const columns = [
    { key: "code", title: "Mã bộ môn" },
    { key: "name", title: "Tên bộ môn" },
    { key: "description", title: "Mô tả", render: (row) => row.description || "Không có" },
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
        title="Quản lý bộ môn"
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
          <Input label="Mã bộ môn" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required placeholder="VD: KHMT" />
          <Input label="Tên bộ môn" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="VD: Khoa học máy tính" />
          <Input label="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="VD: Quản lý các học phần chuyên ngành" />
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
