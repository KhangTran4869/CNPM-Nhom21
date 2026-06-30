import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
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
  max_hours: 180,
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
  max_hours: lecturer?.max_hours || 180,
  status: lecturer?.status || "ACTIVE",
});

/**
 * Trang Quản lý Giảng viên
 * Hiển thị danh sách, tìm kiếm lọc theo bộ môn, thêm/sửa/xóa thông tin giảng viên và khoa trực thuộc
 */
export function LecturersPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", faculty: "", department_id: "", course_id: "", status: "" });
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
      .then((data) => {
        const list = (data || []).filter((item) => {
          const codeUpper = (item.code || "").toUpperCase();
          const nameUpper = (item.name || "").toUpperCase();
          const roleCode = item.user_id?.role_id?.code || item.user_id?.role;
          if (roleCode === "HEAD" || roleCode === "ADMIN") return false;
          if (codeUpper.includes("TRUONGKHOA") || codeUpper.includes("ADMIN")) return false;
          if (nameUpper.includes("TRƯỞNG KHOA") || nameUpper === "ADMIN") return false;
          if (filters.faculty) {
            const fac = item.faculty || item.department_id?.description;
            if (fac !== filters.faculty) return false;
          }
          if (user?.role === "HEAD" && user?.faculty) {
            if (item.faculty !== user.faculty && item.department_id?.description !== user.faculty) return false;
          }
          if (filters.course_id) {
            const targetCourse = courses.find(c => String(c._id) === String(filters.course_id));
            if (targetCourse) {
              const matchDept = targetCourse.department_id && String(item.department_id?._id || item.department_id) === String(targetCourse.department_id?._id || targetCourse.department_id);
              const matchPref = item.preferences && item.preferences.toLowerCase().includes((targetCourse.name || "").toLowerCase());
              if (!matchDept && !matchPref) return false;
            }
          }
          return true;
        });
        setLecturers(list);
      })
      .catch(() => setLecturers([]))
      .finally(() => setLoading(false));
  };

  const loadDepartments = async () => {
    try {
      const depts = await catalogService.getDepartments();
      setDepartments(depts || []);
      catalogService.getCourses().then(setCourses).catch(() => setCourses([]));
      return depts || [];
    } catch {
      setDepartments([]);
      return [];
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(load, [filters, courses, user]);

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
    const initFaculty = isAdmin ? "Khoa Công nghệ thông tin" : (user?.faculty || "Khoa Công nghệ thông tin");
    const matchingDepts = (nextDepartments || []).filter(d => d.description === initFaculty);
    setForm({
      ...emptyForm,
      faculty: initFaculty,
      department_id: matchingDepts?.[0]?._id || nextDepartments?.[0]?._id || "",
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
        actions={null}
      >
        <div className="filter-row">
          <Input label="Tìm kiếm" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="Tên, mã GV..." />
          {user?.role !== "HEAD" && (
            <Select label="Khoa" value={filters.faculty} onChange={(e) => setFilters({ ...filters, faculty: e.target.value, department_id: "" })}>
              <option value="">Tất cả các khoa</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Viễn thông">Khoa Viễn thông</option>
              <option value="Khoa Quản trị Kinh doanh">Khoa Quản trị Kinh doanh</option>
            </Select>
          )}
          <Select label="Bộ môn" value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}>
            <option value="">Tất cả bộ môn</option>
            {departments
              .filter((item) => {
                if (user?.role === "HEAD" && user?.faculty) return item.description === user.faculty;
                if (filters.faculty) return item.description === filters.faculty;
                return true;
              })
              .map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Select label="Trạng thái" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
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
          <Select label="Khoa trực thuộc" value={form.faculty} onChange={(e) => {
            const newFac = e.target.value;
            const matching = departments.filter(d => d.description === newFac);
            setForm({ ...form, faculty: newFac, department_id: matching[0]?._id || "" });
          }} required>
            <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
            <option value="Khoa Viễn thông">Khoa Viễn thông</option>
            <option value="Khoa Quản trị Kinh doanh">Khoa Quản trị Kinh doanh</option>
          </Select>
          <Select label="Bộ môn" value={form.department_id} onChange={(e) => {
            const dept = departments.find(d => String(d._id) === String(e.target.value));
            setForm({ ...form, department_id: e.target.value, faculty: dept?.description || form.faculty });
          }}>
            <option value="">{departments.length ? "Chọn bộ môn" : "Chưa có bộ môn"}</option>
            {departments
              .filter((item) => !form.faculty || item.description === form.faculty)
              .map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Input label="Giờ chuẩn tối đa" type="number" value={form.max_hours} onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })} />
          <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu thông tin</Button>
        </form>
      </Modal>
    </>
  );
}
