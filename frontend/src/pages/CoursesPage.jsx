import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { api } from "../services/api";
import { catalogService } from "../services/catalogService";
import { errorText } from "../utils/format";

const emptyForm = {
  code: "",
  name: "",
  credits: 3,
  department_id: "",
};

const toForm = (course) => ({
  code: course?.code || "",
  name: course?.name || "",
  credits: course?.credits || 3,
  department_id: course?.department_id?._id || course?.department_id || "",
});

export function CoursesPage() {
  const { filteredRows, keyword, setKeyword, loading, error, setError, load } = useResourceList("/courses", {
    searchKeys: ["code", "name", "department_id.name"],
  });
  const [departments, setDepartments] = useState([]);
  const [modal, setModal] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    catalogService.getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const openCreate = () => {
    setError("");
    setSelectedCourse(null);
    setForm({ ...emptyForm, department_id: departments[0]?._id || "" });
    setModal("Thêm môn học");
  };

  const openEdit = (course) => {
    setError("");
    setSelectedCourse(course);
    setForm(toForm(course));
    setModal("Sửa môn học");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, form);
      } else {
        await api.post("/courses", form);
      }
      setModal("");
      setSelectedCourse(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(errorText(err, "Không thể lưu môn học"));
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Xóa môn học ${course.name}?`)) return;
    setError("");
    try {
      await api.delete(`/courses/${course._id}`);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const columns = [
    { key: "code", title: "Mã môn" },
    { key: "name", title: "Tên môn" },
    { key: "credits", title: "Số tín chỉ" },
    { key: "department", title: "Bộ môn", render: (row) => row.department_id?.name || "N/A" },
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
        title="Quản lý môn học"
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
          <Input label="Mã môn" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
          <Input label="Tên môn" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Số tín chỉ" type="number" value={form.credits} onChange={(event) => setForm({ ...form, credits: Number(event.target.value) })} required />
          <Select label="Bộ môn" value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })}>
            <option value="">Chọn bộ môn</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>{department.name}</option>
            ))}
          </Select>
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
