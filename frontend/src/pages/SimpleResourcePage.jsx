import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { api } from "../services/api";
import { catalogService } from "../services/catalogService";

const configs = {
  users: {
    title: "Quản lý tài khoản",
    path: "/users",
    columns: [
      { key: "username", title: "Username" },
      { key: "role", title: "Role", render: (row) => row.role_id?.code || "N/A" },
      { key: "status", title: "Trạng thái" },
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

export function SimpleResourcePage({ type }) {
  const config = configs[type];
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState("");
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: 3,
    department_id: "",
  });
  const [semesterForm, setSemesterForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [roomForm, setRoomForm] = useState({ name: "", capacity: 80 });

  const load = useCallback(() => {
    setLoading(true);
    api.get(config.path, { keyword }).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [config.path, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (type === "courses") {
      catalogService.getDepartments().then(setDepartments).catch(() => setDepartments([]));
    }
  }, [type]);

  const canCreate = type === "courses" || type === "semesters" || type === "rooms";

  const modalTitle =
    type === "courses"
      ? "Thêm môn học"
      : type === "semesters"
        ? "Thêm học kỳ"
        : "Thêm phòng học";

  const createItem = async (event) => {
    event.preventDefault();
    if (type === "courses") {
      await api.post("/courses", courseForm);
      setCourseForm({ code: "", name: "", credits: 3, department_id: "" });
    }
    if (type === "rooms") {
      await api.post("/rooms", roomForm);
      setRoomForm({ name: "", capacity: 80 });
    }
    if (type === "semesters") {
      await api.post("/semesters", semesterForm);
      setSemesterForm({ name: "", start_date: "", end_date: "" });
    }
    setModal("");
    load();
  };

  return (
    <>
      <Card
        title={config.title}
        actions={
          <div className="row-actions">
            {canCreate && <Button onClick={() => setModal(modalTitle)}>Thêm mới</Button>}
            <Button variant="outline" onClick={load}>Làm mới</Button>
          </div>
        }
      >
        <div className="filter-row">
          <Input label="Tìm kiếm" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <Table columns={config.columns} rows={rows} loading={loading} />
      </Card>
      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={createItem}>
          {type === "courses" && (
            <>
              <Input label="Mã môn" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
              <Input label="Tên môn" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
              <Input label="Số tín chỉ" type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })} />
              <Select label="Bộ môn" value={courseForm.department_id} onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}>
                <option value="">Chọn bộ môn</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>{department.name}</option>
                ))}
              </Select>
            </>
          )}
          {type === "rooms" && (
            <>
              <Input label="Tên phòng" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
              <Input label="Sức chứa" type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} />
            </>
          )}
          {type === "semesters" && (
            <>
              <Input label="Tên học kỳ" value={semesterForm.name} onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })} />
              <Input label="Ngày bắt đầu" type="date" value={semesterForm.start_date} onChange={(e) => setSemesterForm({ ...semesterForm, start_date: e.target.value })} />
              <Input label="Ngày kết thúc" type="date" value={semesterForm.end_date} onChange={(e) => setSemesterForm({ ...semesterForm, end_date: e.target.value })} />
            </>
          )}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}

export function ForbiddenPage() {
  return (
    <Card title="403">
      <div className="empty-page">Bạn không có quyền truy cập chức năng này.</div>
    </Card>
  );
}

export function ComingSoonPage({ title = "Chức năng đang hoàn thiện" }) {
  return (
    <Card title={title}>
      <div className="empty-page">Màn hình này đã được đặt trong menu và sẵn sàng mở rộng.</div>
    </Card>
  );
}
