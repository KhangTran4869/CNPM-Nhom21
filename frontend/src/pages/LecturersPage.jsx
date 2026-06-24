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

const toLecturerForm = (lecturer) => ({
  code: lecturer?.code || "",
  name: lecturer?.name || "",
  email: lecturer?.email || "",
  phone: lecturer?.phone || "",
  degree: lecturer?.degree || "",
  department_id: lecturer?.department_id?._id || lecturer?.department_id || "",
  max_hours: lecturer?.max_hours || 120,
  status: lecturer?.status || "ACTIVE",
});

export function LecturersPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", department_id: "", status: "" });
  const [form, setForm] = useState(emptyForm);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [modal, setModal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    lecturerService.getLecturers(filters).then(setLecturers).catch(() => setLecturers([])).finally(() => setLoading(false));
  };

  const loadDepartments = () =>
    catalogService
      .getDepartments()
      .then((data) => {
        setDepartments(data);
        return data;
      })
      .catch(() => {
        setDepartments([]);
        return [];
      });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(load, [filters]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.department_id) {
      setError("Vui lòng chọn bộ môn trước khi lưu");
      return;
    }
    try {
      if (modal === "Sửa giảng viên") {
        await lecturerService.updateLecturer(selectedLecturer._id, form);
      } else {
        await lecturerService.createLecturer(form);
      }
      setModal("");
      setForm(emptyForm);
      setSelectedLecturer(null);
      load();
    } catch (err) {
      setError(
        err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") ||
          err.message ||
          "Không thể tạo giảng viên",
      );
    }
  };

  const openCreate = async () => {
    setError("");
    setSelectedLecturer(null);
    const nextDepartments = await loadDepartments();
    setForm({
      ...emptyForm,
      department_id: nextDepartments?.[0]?._id || departments[0]?._id || "",
    });
    setModal("Thêm giảng viên");
  };

  const openDetail = (lecturer) => {
    setSelectedLecturer(lecturer);
    setError("");
    setModal("Chi tiết giảng viên");
  };

  const openEdit = async (lecturer) => {
    setError("");
    await loadDepartments();
    setSelectedLecturer(lecturer);
    setForm(toLecturerForm(lecturer));
    setModal("Sửa giảng viên");
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
    { key: "account", title: "Tài khoản", render: (row) => row.user_id?.username || "Chưa có" },
    { key: "max_hours", title: "Max hours" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          <Button variant="outline" onClick={() => openDetail(row)}>Chi tiết</Button>
          {isAdmin && <Button variant="outline" onClick={() => openEdit(row)}>Sửa</Button>}
          {isAdmin && <Button variant="danger" onClick={() => remove(row._id)}>Xóa</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Quản lý giảng viên"
        actions={isAdmin && <Button onClick={openCreate}>Thêm giảng viên</Button>}
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
      <Modal title={modal === "Chi tiết giảng viên" ? modal : ""} onClose={() => setModal("")}>
        <div className="form-grid">
          <label className="field">
            <span>Mã GV</span>
            <div className="alert">{selectedLecturer?.code || "N/A"}</div>
          </label>
          <label className="field">
            <span>Họ tên</span>
            <div className="alert">{selectedLecturer?.name || "N/A"}</div>
          </label>
          <label className="field">
            <span>Email</span>
            <div className="alert">{selectedLecturer?.email || "N/A"}</div>
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <div className="alert">{selectedLecturer?.phone || "N/A"}</div>
          </label>
          <label className="field">
            <span>Học vị</span>
            <div className="alert">{selectedLecturer?.degree || "N/A"}</div>
          </label>
          <label className="field">
            <span>Bộ môn</span>
            <div className="alert">{selectedLecturer?.department_id?.name || "Chưa cập nhật"}</div>
          </label>
          <label className="field">
            <span>Max hours</span>
            <div className="alert">{selectedLecturer?.max_hours ?? "N/A"}</div>
          </label>
          <label className="field">
            <span>Trạng thái</span>
            <div className="alert"><Badge>{selectedLecturer?.status || "N/A"}</Badge></div>
          </label>
          {selectedLecturer?.user_id && (
            <label className="field wide">
              <span>Tài khoản liên kết</span>
              <div className="alert">{selectedLecturer.user_id?.username || selectedLecturer.user_id?._id || "N/A"}</div>
            </label>
          )}
          {isAdmin && (
            <div className="form-actions">
              <Button variant="outline" onClick={() => openEdit(selectedLecturer)}>Sửa thông tin</Button>
            </div>
          )}
        </div>
      </Modal>

      <Modal title={modal === "Thêm giảng viên" || modal === "Sửa giảng viên" ? modal : ""} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Mã GV" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={modal === "Sửa giảng viên"} />
          <Input label="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Học vị" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          <Select label="Bộ môn" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">{departments.length ? "Chọn bộ môn" : "Chưa có bộ môn"}</option>
            {departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Input label="Max hours" type="number" value={form.max_hours} onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })} />
          <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BUSY">BUSY</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
