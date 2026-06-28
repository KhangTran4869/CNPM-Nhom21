import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { api } from "../services/api";
import { catalogService } from "../services/catalogService";
import { lecturerService } from "../services/lecturerService";

// Mẫu dữ liệu mặc định khi thêm giảng viên mới
const emptyForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  degree: "",
  faculty: "Khoa Công nghệ thông tin",
  department_id: "",
  user_id: "",
  max_hours: 120,
  status: "ACTIVE",
};

// Map dữ liệu từ đối tượng giảng viên sang form chỉnh sửa
const toLecturerForm = (lecturer) => ({
  code: lecturer?.code || "",
  name: lecturer?.name || "",
  email: lecturer?.email || "",
  phone: lecturer?.phone || "",
  degree: lecturer?.degree || "",
  faculty: lecturer?.faculty || "Khoa Công nghệ thông tin",
  department_id: lecturer?.department_id?._id || lecturer?.department_id || "",
  user_id: lecturer?.user_id?._id || lecturer?.user_id || "",
  max_hours: lecturer?.max_hours || 120,
  status: lecturer?.status || "ACTIVE",
});

/**
 * Trang Quản lý Giảng viên
 * Hiển thị danh sách, tìm kiếm lọc theo bộ môn, thêm/sửa/xóa thông tin giảng viên và khoa trực thuộc
 */
export function LecturersPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", department_id: "", status: "" });
  const [form, setForm] = useState(emptyForm);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [modal, setModal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    lecturerService
      .getLecturers(filters)
      .then(setLecturers)
      .catch(() => setLecturers([]))
      .finally(() => setLoading(false));
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

  // Chỉ tải danh sách User khi người đăng nhập là Admin (tránh lỗi 403 Forbidden cho Trưởng khoa)
  const loadUsers = () => {
    api.get("/users").then((data) => setUsers(data || [])).catch(() => setUsers([]));
  };

  useEffect(() => {
    loadDepartments();
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  useEffect(load, [filters]);

  // Xử lý gửi form Thêm mới hoặc Cập nhật Giảng viên
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.department_id) {
      setError("Vui lòng chọn bộ môn trước khi lưu");
      return;
    }
    const payload = { ...form };
    if (!payload.user_id) delete payload.user_id;

    try {
      if (modal === "Sửa giảng viên") {
        await lecturerService.updateLecturer(selectedLecturer._id, payload);
      } else {
        await lecturerService.createLecturer(payload);
      }
      setModal("");
      setForm(emptyForm);
      setSelectedLecturer(null);
      load();
      if (isAdmin) loadUsers();
    } catch (err) {
      setError(
        err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") ||
          err.message ||
          "Không thể lưu thông tin giảng viên",
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
      user_id: "",
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
    if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này?")) {
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
    { key: "faculty", title: "Khoa", render: (row) => row.faculty || "Khoa Công nghệ thông tin" },
    { key: "department", title: "Bộ môn", render: (row) => row.department_id?.name || "Chưa cập nhật" },
    { key: "account", title: "Tài khoản", render: (row) => row.user_id?.username || "Chưa kết nối" },
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
          <Input label="Tìm kiếm" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="Tên, mã GV..." />
          <Select label="Bộ môn" value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}>
            <option value="">Tất cả bộ môn</option>
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

      {/* Modal hiển thị chi tiết giảng viên */}
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
            <span>Khoa trực thuộc</span>
            <div className="alert">{selectedLecturer?.faculty || "Khoa Công nghệ thông tin"}</div>
          </label>
          <label className="field">
            <span>Bộ môn</span>
            <div className="alert">{selectedLecturer?.department_id?.name || "Chưa cập nhật"}</div>
          </label>
          <label className="field">
            <span>Giờ chuẩn tối đa</span>
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

      {/* Modal Thêm hoặc Sửa giảng viên */}
      <Modal title={modal === "Thêm giảng viên" || modal === "Sửa giảng viên" ? modal : ""} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Mã GV" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={modal === "Sửa giảng viên"} placeholder="VD: GV001 (Để trống sẽ tự tạo)" />
          <Input label="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Học vị" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="ThS, TS, PGS.TS..." />
          <Input label="Khoa trực thuộc" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="VD: Khoa Công nghệ thông tin" />
          <Select label="Bộ môn" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">{departments.length ? "Chọn bộ môn" : "Chưa có bộ môn"}</option>
            {departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Select label="Tài khoản đăng nhập liên kết" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
            <option value="">Tự động tạo mới (Username = Mã GV, Pass = 123456)</option>
            {users.filter(u => !u.lecturer_id && u.role !== "ADMIN").map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>{u.username} ({u.role || "USER"})</option>
            ))}
          </Select>
          <Input label="Giờ chuẩn tối đa" type="number" value={form.max_hours} onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })} />
          <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BUSY">BUSY</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu thông tin</Button>
        </form>
      </Modal>
    </>
  );
}
