import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { catalogService } from "../services/catalogService";
import { lecturerService } from "../services/lecturerService";

const emptyForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  degree: "",
  department_id: "",
  max_hours: 120,
  status: "ACTIVE",
};

export function LecturersPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", department_id: "", status: "" });
  const [form, setForm] = useState(emptyForm);
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    lecturerService.getLecturers(filters).then(setLecturers).catch(() => setLecturers([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    catalogService.getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(load, [filters]);

  const submit = async (event) => {
    event.preventDefault();
    await lecturerService.createLecturer(form);
    setModal("");
    setForm(emptyForm);
    load();
  };

  const remove = async (id) => {
    if (window.confirm("Xóa giảng viên này?")) {
      await lecturerService.deleteLecturer(id);
      load();
    }
  };

  const columns = [
    { key: "code", title: "Mã GV" },
    { key: "name", title: "Họ tên" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Số điện thoại" },
    { key: "degree", title: "Học vị" },
    { key: "department", title: "Bộ môn", render: (row) => row.department_id?.name || "Chưa cập nhật" },
    { key: "max_hours", title: "Max hours" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          <Button variant="outline" onClick={() => alert(JSON.stringify(row, null, 2))}>Chi tiết</Button>
          {isAdmin && <Button variant="danger" onClick={() => remove(row._id)}>Xóa</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Quản lý giảng viên"
        actions={isAdmin && <Button onClick={() => setModal("Thêm giảng viên")}>Thêm giảng viên</Button>}
      >
        <div className="filter-row">
          <Input label="Tìm kiếm" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
          <Select label="Bộ môn" value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}>
            <option value="">Tất cả</option>
            {departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Select label="Trạng thái" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BUSY">BUSY</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
        </div>
        <Table columns={columns} rows={lecturers} loading={loading} />
      </Card>
      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Mã GV" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Học vị" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          <Select label="Bộ môn" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Chọn bộ môn</option>
            {departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Input label="Max hours" type="number" value={form.max_hours} onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })} />
          <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BUSY">BUSY</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
