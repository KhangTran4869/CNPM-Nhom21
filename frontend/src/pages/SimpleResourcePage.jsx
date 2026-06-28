import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { api } from "../services/api";
import { catalogService } from "../services/catalogService";

// Cấu trúc cấu hình cho các trang quản lý danh mục đơn giản
const configs = {
  users: {
    title: "Quản lý tài khoản",
    path: "/users",
    columns: [
      { key: "username", title: "Username" },
      { key: "role", title: "Role", render: (row) => row.role || row.role_id?.code || "N/A" },
      { key: "status", title: "Trạng thái" },
    ],
  },
  departments: {
    title: "Quản lý bộ môn",
    path: "/departments",
    columns: [
      { key: "code", title: "Mã bộ môn" },
      { key: "name", title: "Tên bộ môn" },
      { key: "description", title: "Mô tả", render: (row) => row.description || "Không có" },
    ],
  },
  courses: {
    title: "Quản lý môn học",
    path: "/courses",
    columns: [
      { key: "code", title: "Mã môn" },
      { key: "name", title: "Tên môn" },
      { key: "credits", title: "Số tín chỉ" },
      { key: "department", title: "Bộ môn", render: (row) => row.department_id?.name || "N/A" },
    ],
  },
  semesters: {
    title: "Quản lý học kỳ",
    path: "/semesters",
    columns: [
      { key: "name", title: "Tên học kỳ" },
      { key: "start_date", title: "Ngày bắt đầu", render: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString("vi-VN") : "N/A" },
      { key: "end_date", title: "Ngày kết thúc", render: (row) => row.end_date ? new Date(row.end_date).toLocaleDateString("vi-VN") : "N/A" },
    ],
  },
  rooms: {
    title: "Quản lý phòng học",
    path: "/rooms",
    columns: [
      { key: "name", title: "Tên phòng" },
      { key: "capacity", title: "Sức chứa" },
    ],
  },
  history: {
    title: "Lịch sử thay đổi phân công",
    path: "/assignment-history",
    columns: [
      { key: "assignment", title: "Assignment", render: (row) => row.assignment_id?._id || row.assignment_id },
      { key: "old", title: "GV cũ", render: (row) => row.old_lecturer_id?.name || "N/A" },
      { key: "new", title: "GV mới", render: (row) => row.new_lecturer_id?.name || "N/A" },
      { key: "changed_at", title: "Thời gian", render: (row) => row.changed_at ? new Date(row.changed_at).toLocaleString("vi-VN") : "N/A" },
    ],
  },
};

/**
 * Component quản lý danh mục dùng chung (Tài khoản, Bộ môn, Môn học, Phòng, Học kỳ...)
 */
export function SimpleResourcePage({ type }) {
  const config = configs[type];
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState("");
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // States lưu dữ liệu form cho các danh mục
  const [courseForm, setCourseForm] = useState({ code: "", name: "", credits: 3, department_id: "" });
  const [roomForm, setRoomForm] = useState({ name: "", capacity: 80 });
  const [semesterForm, setSemesterForm] = useState({ name: "", start_date: "", end_date: "" });
  const [userForm, setUserForm] = useState({ username: "", password: "", role_id: "", status: "ACTIVE" });
  const [departmentForm, setDepartmentForm] = useState({ code: "", name: "", description: "" });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(config.path)
      .then((data) => setRows(Array.isArray(data) ? data : data?.items || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [config.path]);

  useEffect(() => {
    load();
    if (type === "courses" || type === "departments") {
      catalogService.getDepartments().then((data) => {
        setDepartments(data || []);
        setCourseForm((prev) => ({ ...prev, department_id: data?.[0]?._id || "" }));
      }).catch(() => setDepartments([]));
    }
    if (type === "users") {
      catalogService.getRoles().then((data) => {
        setRoles(data || []);
        setUserForm((prev) => ({ ...prev, role_id: data?.[0]?._id || "" }));
      }).catch(() => setRoles([]));
    }
  }, [load, type]);

  // Xử lý mở modal Chỉnh sửa thông tin
  const openEdit = (row) => {
    setError("");
    setSelectedItem(row);
    if (type === "users") {
      setUserForm({
        username: row.username || "",
        password: "",
        role_id: row.role_id?._id || row.role_id || "",
        status: row.status || "ACTIVE",
      });
      setModal("Sửa tài khoản");
    }
    if (type === "departments") {
      setDepartmentForm({
        code: row.code || "",
        name: row.name || "",
        description: row.description || "",
      });
      setModal("Sửa bộ môn");
    }
  };

  // Thêm cột nút Hành động (Sửa) cho danh mục User và Department
  const columns = useMemo(() => {
    const cols = [...config.columns];
    if (type === "users" || type === "departments") {
      cols.push({
        key: "actions",
        title: "Hành động",
        render: (row) => (
          <Button variant="outline" onClick={() => openEdit(row)}>Sửa</Button>
        ),
      });
    }
    return cols;
  }, [config.columns, type]);

  const canCreate = type === "courses" || type === "semesters" || type === "rooms" || type === "users" || type === "departments";

  const modalTitle =
    type === "courses"
      ? "Thêm môn học"
      : type === "semesters"
        ? "Thêm học kỳ"
        : type === "rooms"
          ? "Thêm phòng học"
          : type === "users"
            ? "Thêm tài khoản"
            : "Thêm bộ môn";

  const openCreate = () => {
    setError("");
    setSelectedItem(null);
    setModal(modalTitle);
    if (type === "users") setUserForm({ username: "", password: "", role_id: roles?.[0]?._id || "", status: "ACTIVE" });
    if (type === "departments") setDepartmentForm({ code: "", name: "", description: "" });
  };

  // Xử lý Thêm mới hoặc Cập nhật bản ghi danh mục
  const createItem = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (modal === "Sửa tài khoản") {
        const payload = { role_id: userForm.role_id, status: userForm.status };
        if (userForm.password && userForm.password.trim() !== "") payload.password = userForm.password;
        await api.put(`/users/${selectedItem._id}`, payload);
      } else if (modal === "Sửa bộ môn") {
        await api.put(`/departments/${selectedItem._id}`, departmentForm);
      } else {
        if (type === "courses") {
          await api.post("/courses", courseForm);
          setCourseForm({ code: "", name: "", credits: 3, department_id: departments?.[0]?._id || "" });
        }
        if (type === "rooms") {
          await api.post("/rooms", roomForm);
          setRoomForm({ name: "", capacity: 80 });
        }
        if (type === "semesters") {
          await api.post("/semesters", semesterForm);
          setSemesterForm({ name: "", start_date: "", end_date: "" });
        }
        if (type === "users") {
          await api.post("/users", userForm);
          setUserForm({ username: "", password: "", role_id: roles?.[0]?._id || "", status: "ACTIVE" });
        }
        if (type === "departments") {
          await api.post("/departments", departmentForm);
          setDepartmentForm({ code: "", name: "", description: "" });
        }
      }
      setModal("");
      load();
    } catch (err) {
      setError(
        err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") ||
          err.message ||
          "Không thể lưu bản ghi",
      );
    }
  };

  return (
    <>
      <Card
        title={config.title}
        actions={canCreate && <Button onClick={openCreate}>{modalTitle}</Button>}
      >
        <Table columns={columns} rows={rows} loading={loading} />
      </Card>

      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={createItem}>
          {type === "courses" && (
            <>
              <Input label="Mã môn" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} required />
              <Input label="Tên môn" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required />
              <Input label="Số tín chỉ" type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })} required />
              <Select label="Bộ môn" value={courseForm.department_id} onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })} required>
                <option value="">Chọn bộ môn</option>
                {departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </Select>
            </>
          )}

          {type === "rooms" && (
            <>
              <Input label="Tên phòng" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} required />
              <Input label="Sức chứa" type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} required />
            </>
          )}

          {type === "semesters" && (
            <>
              <Input label="Tên học kỳ" value={semesterForm.name} onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })} required placeholder="VD: Học kỳ 1 2026-2027" />
              <Input label="Ngày bắt đầu" type="date" value={semesterForm.start_date} onChange={(e) => setSemesterForm({ ...semesterForm, start_date: e.target.value })} required />
              <Input label="Ngày kết thúc" type="date" value={semesterForm.end_date} onChange={(e) => setSemesterForm({ ...semesterForm, end_date: e.target.value })} required />
            </>
          )}

          {type === "users" && (
            <>
              <Input label="Tên đăng nhập" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required disabled={modal === "Sửa tài khoản"} placeholder="VD: giangvien_a" />
              <Input label={modal === "Sửa tài khoản" ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"} type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={modal !== "Sửa tài khoản"} minLength={modal === "Sửa tài khoản" && !userForm.password ? undefined : 6} placeholder="Ít nhất 6 ký tự" />
              <Select label="Vai trò (Role)" value={userForm.role_id} onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })} required>
                <option value="">Chọn vai trò</option>
                {roles.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.code})</option>)}
              </Select>
              <Select label="Trạng thái" value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </Select>
            </>
          )}

          {type === "departments" && (
            <>
              <Input label="Mã bộ môn" value={departmentForm.code} onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })} required disabled={modal === "Sửa bộ môn"} placeholder="VD: CNPM" />
              <Input label="Tên bộ môn" value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} required placeholder="VD: Công nghệ phần mềm" />
              <Input label="Mô tả chi tiết" value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} placeholder="VD: Quản lý các môn chuyên ngành phần mềm" />
            </>
          )}

          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}

export function ForbiddenPage() {
  return (
    <Card title="Không có quyền truy cập">
      <div className="empty-state">
        Bạn không có đủ quyền hạn (Role) để truy cập hoặc thực hiện thao tác trên màn hình này.
      </div>
    </Card>
  );
}

export function ComingSoonPage({ title }) {
  return (
    <Card title={title}>
      <div className="empty-state">Tính năng đang trong quá trình phát triển hoàn thiện.</div>
    </Card>
  );
}
