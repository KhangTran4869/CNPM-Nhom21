import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { assignmentService } from "../services/assignmentService";
import { classService } from "../services/classService";

const initialForm = { class_id: "", lecturer_id: "", note: "" };

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const scheduleText = (schedule) =>
  `Thứ ${schedule.day_of_week}, tiết ${schedule.start_period}-${schedule.end_period}, phòng ${schedule.room_id?.name || "N/A"}`;

const errorText = (err) => {
  if (err?.status === 403 || err?.payload?.errors?.includes("FORBIDDEN")) {
    return "Bạn không có quyền thực hiện chức năng này.";
  }
  return (
    err.payload?.errors
      ?.map((item) => item.message || item.rule || item)
      .join(", ") ||
    err.message ||
    "Thao tác không thành công"
  );
};

export function AssignmentsPage({ user, navigate }) {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modal, setModal] = useState("");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLecturer = user?.role === "LECTURER";
  const canWrite = user?.role === "ADMIN" || user?.role === "HEAD";
  const isAdmin = user?.role === "ADMIN";
  const canViewHistory = user?.role === "ADMIN" || user?.role === "HEAD";

  const availableClasses = useMemo(
    () => classes.filter((item) => item.status === "OPEN" || item._id === form.class_id),
    [classes, form.class_id],
  );

  const load = () => {
    setLoading(true);
    assignmentService
      .getAssignments()
      .then(setAssignments)
      .catch((err) => {
        console.error("Không thể tải danh sách phân công", err);
        setAssignments([]);
        setError(errorText(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canWrite) {
      classService.getClasses().then(setClasses).catch(() => setClasses([]));
    }
  }, [canWrite]);

  const loadClassContext = async (classId) => {
    if (!classId) {
      setSchedules([]);
      setSuggestions([]);
      return;
    }
    const [nextSchedules, nextSuggestions] = await Promise.all([
      classService.getClassSchedules(classId),
      classService.getSuggestedLecturers(classId),
    ]);
    setSchedules(nextSchedules);
    setSuggestions(nextSuggestions);
  };

  const changeClass = async (classId) => {
    setForm((current) => ({ ...current, class_id: classId, lecturer_id: "" }));
    setError("");
    try {
      await loadClassContext(classId);
    } catch (err) {
      setSchedules([]);
      setSuggestions([]);
      setError(errorText(err));
    }
  };

  const openCreate = () => {
    setSelectedAssignment(null);
    setForm(initialForm);
    setSchedules([]);
    setSuggestions([]);
    setError("");
    setModal("Thêm phân công");
  };

  const openChangeLecturer = async (assignment) => {
    setSelectedAssignment(assignment);
    setForm({
      class_id: assignment.class_id?._id || "",
      lecturer_id: assignment.lecturer_id?._id || "",
      note: assignment.note || "",
    });
    setError("");
    setModal("Đổi giảng viên");
    try {
      await loadClassContext(assignment.class_id?._id);
    } catch (err) {
      setError(errorText(err));
    }
  };

  const openHistory = async (assignment) => {
    if (!canViewHistory) return;
    setSelectedAssignment(assignment);
    setError("");
    setModal("Lịch sử phân công");
    try {
      const data = await assignmentService.getAssignmentHistory(assignment._id);
      setHistory(data);
    } catch (err) {
      console.error("Không thể tải lịch sử phân công", err);
      setHistory([]);
      setError(errorText(err));
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isAdmin) {
        await assignmentService.createAssignment({ ...form, status: "APPROVED" });
      } else {
        await assignmentService.proposeAssignment(form);
      }
      setModal("");
      load();
      classService.getClasses().then(setClasses).catch(() => setClasses([]));
    } catch (err) {
      setError(errorText(err));
    }
  };

  const submitChangeLecturer = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await assignmentService.updateAssignment(selectedAssignment._id, {
        lecturer_id: form.lecturer_id,
        note: form.note,
      });
      setModal("");
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const approve = async (assignment) => {
    if (!window.confirm(`Duyệt phân công lớp ${assignment.class_id?.code || ""}?`)) return;
    setError("");
    try {
      await assignmentService.approveAssignment(assignment._id);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const remove = async (assignment) => {
    if (!window.confirm(`Xóa phân công lớp ${assignment.class_id?.code || ""}?`)) return;
    setError("");
    try {
      await assignmentService.deleteAssignment(assignment._id);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const columns = [
    { key: "class", title: "Lớp", render: (row) => row.class_id?.code || "N/A" },
    { key: "course", title: "Môn học", render: (row) => row.class_id?.course_id?.name || "N/A" },
    { key: "semester", title: "Học kỳ", render: (row) => row.class_id?.semester_id?.name || "N/A" },
    { key: "lecturer", title: "Giảng viên", render: (row) => row.lecturer_id?.name || "N/A" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{String(row.status || "").toUpperCase()}</Badge> },
    { key: "creator", title: "Người phân công", render: (row) => row.assigned_by?.username || "N/A" },
    { key: "createdAt", title: "Ngày tạo", render: (row) => formatDateTime(row.createdAt || row.created_at) },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          {canViewHistory && <Button variant="outline" onClick={() => openHistory(row)}>Lịch sử</Button>}
          {isAdmin && row.status === "PENDING" && <Button variant="primary" onClick={() => approve(row)}>Duyệt</Button>}
          {isAdmin && <Button variant="outline" onClick={() => openChangeLecturer(row)}>Sửa</Button>}
          {isAdmin && <Button variant="danger" onClick={() => remove(row)}>Xóa</Button>}
        </div>
      ),
    },
  ];

  const suggestionColumns = [
    { key: "code", title: "Mã GV" },
    { key: "name", title: "Họ tên" },
    { key: "department", title: "Bộ môn" },
    { key: "current_hours", title: "Giờ đang dạy" },
    { key: "max_hours", title: "Định mức" },
    { key: "available_hours", title: "Còn lại" },
    {
      key: "actions",
      title: "Chọn",
      render: (row) => (
        <Button
          variant={form.lecturer_id === row.lecturer_id ? "primary" : "outline"}
          onClick={() => setForm((current) => ({ ...current, lecturer_id: row.lecturer_id }))}
        >
          Chọn
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { key: "assignment", title: "Assignment ID", render: (row) => row.assignment_id?._id || row.assignment_id },
    { key: "old", title: "Giảng viên cũ", render: (row) => row.old_lecturer_id?.name || row.old_lecturer?.name || "N/A" },
    { key: "new", title: "Giảng viên mới", render: (row) => row.new_lecturer_id?.name || row.new_lecturer?.name || "N/A" },
    { key: "changed_at", title: "Thời gian thay đổi", render: (row) => formatDateTime(row.changed_at) },
  ];

  return (
    <div className="page-stack">
      <Card
        title={isLecturer ? "Phân công của tôi" : "Danh sách phân công"}
        actions={
          <div className="row-actions">
            {isAdmin && (
              <Button
                variant="outline"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)", fontWeight: 600 }}
                onClick={() => navigate?.("/assignments/approval")}
              >
                ⚡ Duyệt đề xuất (Pending)
              </Button>
            )}
            {canWrite && <Button onClick={openCreate}>{isAdmin ? "Thêm phân công" : "Đề xuất phân công"}</Button>}
            <Button variant="outline" onClick={load}>Làm mới</Button>
          </div>
        }
      >
        {error && !modal && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={assignments} loading={loading} />
      </Card>

      {modal === "Thêm phân công" && (
        <Modal title={modal} onClose={() => setModal("")}>
          <form className="form-grid" onSubmit={submitCreate}>
            <Select label="Lớp tín chỉ" value={form.class_id} onChange={(event) => changeClass(event.target.value)} required>
              <option value="">Chọn lớp</option>
              {availableClasses.map((item) => (
                <option key={item._id} value={item._id}>{item.code} - {item.course_id?.name || "N/A"}</option>
              ))}
            </Select>
            <label className="field wide">
              <span>Lịch học của lớp</span>
              <div className="alert">
                {schedules.length ? schedules.map(scheduleText).join("; ") : "Chưa chọn lớp hoặc lớp chưa có lịch học"}
              </div>
            </label>
            <label className="field wide">
              <span>Giảng viên phù hợp</span>
              <Table columns={suggestionColumns} rows={suggestions} emptyText="Không có giảng viên phù hợp" />
            </label>
            <Select label="Giảng viên đã chọn" value={form.lecturer_id} onChange={(event) => setForm({ ...form, lecturer_id: event.target.value })} required>
              <option value="">Chọn giảng viên</option>
              {suggestions.map((item) => (
                <option key={item.lecturer_id} value={item.lecturer_id}>{item.code} - {item.name}</option>
              ))}
            </Select>
            <label className="field wide">
              <span>Ghi chú</span>
              <textarea className="uis-input" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </label>
            {error && <div className="alert danger">{error}</div>}
            <Button className="form-submit" type="submit">Lưu</Button>
          </form>
        </Modal>
      )}

      {modal === "Đổi giảng viên" && (
        <Modal title={modal} onClose={() => setModal("")}>
          <form className="form-grid" onSubmit={submitChangeLecturer}>
            <label className="field">
              <span>Giảng viên hiện tại</span>
              <div className="alert">{selectedAssignment?.lecturer_id?.name || "N/A"}</div>
            </label>
            <label className="field wide">
              <span>Lịch học của lớp</span>
              <div className="alert">
                {schedules.length ? schedules.map(scheduleText).join("; ") : "Lớp chưa có lịch học"}
              </div>
            </label>
            <label className="field wide">
              <span>Giảng viên phù hợp</span>
              <Table columns={suggestionColumns} rows={suggestions} emptyText="Không có giảng viên phù hợp" />
            </label>
            <Select label="Giảng viên mới" value={form.lecturer_id} onChange={(event) => setForm({ ...form, lecturer_id: event.target.value })} required>
              <option value="">Chọn giảng viên</option>
              {suggestions.map((item) => (
                <option key={item.lecturer_id} value={item.lecturer_id}>{item.code} - {item.name}</option>
              ))}
            </Select>
            <label className="field wide">
              <span>Ghi chú</span>
              <textarea className="uis-input" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </label>
            {error && <div className="alert danger">{error}</div>}
            <Button className="form-submit" type="submit">Lưu thay đổi</Button>
          </form>
        </Modal>
      )}

      {modal === "Lịch sử phân công" && (
        <Modal title={modal} onClose={() => setModal("")}>
          {error && <div className="alert danger">{error}</div>}
          <Table columns={historyColumns} rows={history} />
        </Modal>
      )}
    </div>
  );
}
