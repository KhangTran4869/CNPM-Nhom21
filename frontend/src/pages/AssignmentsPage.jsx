import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { assignmentService } from "../services/assignmentService";
import { classService } from "../services/classService";
import { catalogService } from "../services/catalogService";

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
  const [semesters, setSemesters] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modal, setModal] = useState("");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFixedClass, setIsFixedClass] = useState(false);
  const isLecturer = user?.role === "LECTURER";
  const canWrite = user?.role === "ADMIN" || user?.role === "HEAD";
  const isAdmin = user?.role === "ADMIN";
  const isHead = user?.role === "HEAD";
  const canViewHistory = user?.role === "ADMIN" || user?.role === "HEAD";

  const assignedClassIds = useMemo(
    () => new Set(assignments.map((item) => item.class_id?._id || item.class_id)),
    [assignments]
  );

  const availableClasses = useMemo(
    () => classes.filter((item) => {
      if (item._id === form.class_id) return true;
      if (item.status !== "OPEN" || assignedClassIds.has(item._id)) return false;
      if (semesterFilter && String(item.semester_id?._id || item.semester_id) !== semesterFilter) return false;
      return true;
    }),
    [classes, assignedClassIds, form.class_id, semesterFilter],
  );

  const tableRows = useMemo(() => {
    const unassignedRows = classes
      .filter((cls) => cls.status === "OPEN" && !assignedClassIds.has(cls._id))
      .map((cls) => ({
        _id: `unassigned-${cls._id}`,
        is_unassigned: true,
        class_id: cls,
        lecturer_id: null,
        status: "OPEN",
        assigned_by: null,
        createdAt: cls.createdAt,
      }));
    return [...assignments, ...unassignedRows];
  }, [assignments, classes, assignedClassIds]);

  const load = () => {
    setLoading(true);
    const params = {};
    if (semesterFilter) params.semester_id = semesterFilter;
    assignmentService
      .getAssignments(params)
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
    catalogService.getSemesters().then(setSemesters).catch(() => setSemesters([]));
  }, [canWrite]);

  useEffect(() => {
    load();
  }, [semesterFilter]);

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
    setSuggestions((nextSuggestions || []).filter((item) => {
      if (item.role_code === "HEAD" || item.role_code === "ADMIN") return false;
      const codeUpper = (item.code || "").toUpperCase();
      const nameUpper = (item.name || "").toUpperCase();
      if (codeUpper.includes("TRUONGKHOA") || codeUpper.includes("ADMIN")) return false;
      if (nameUpper.includes("TRƯỞNG KHOA") || nameUpper === "ADMIN") return false;
      return true;
    }));
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

  const openCreate = (isFixed = false) => {
    setSelectedAssignment(null);
    setForm(initialForm);
    setSchedules([]);
    setSuggestions([]);
    setError("");
    setIsFixedClass(Boolean(isFixed));
    setModal(isHead ? "Đề xuất phân công" : "Thêm phân công");
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

  const openGlobalHistory = async () => {
    if (!canViewHistory) return;
    setSelectedAssignment(null);
    setError("");
    setModal("Lịch sử phân công");
    try {
      const data = await assignmentService.getAllAssignmentHistory();
      setHistory(data);
    } catch (err) {
      console.error("Không thể tải lịch sử phân công chung", err);
      setHistory([]);
      setError(errorText(err));
    }
  };

  const removeHistoryItem = async (historyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi lịch sử này không?")) return;
    try {
      await assignmentService.deleteAssignmentHistory(historyId);
      if (selectedAssignment) {
        const data = await assignmentService.getAssignmentHistory(selectedAssignment._id);
        setHistory(data);
      } else {
        const data = await assignmentService.getAllAssignmentHistory();
        setHistory(data);
      }
    } catch (err) {
      alert(errorText(err));
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

  const autoAssignAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hệ thống chạy Thuật toán tối ưu để tự động phân công cho các lớp chưa có giảng viên?")) return;
    setMessage("");
    setError("");
    try {
      const res = await assignmentService.autoAssign(semesterFilter ? { semester_id: semesterFilter } : {});
      setMessage(res?.message || "Phân công tự động hoàn tất!");
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
    { key: "lecturer", title: "Giảng viên", render: (row) => row.is_unassigned ? <span style={{ color: "#64748b", fontStyle: "italic" }}>Chưa phân công</span> : row.lecturer_id?.name || "N/A" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge variant={row.status === "OPEN" ? "info" : undefined}>{String(row.status || "").toUpperCase()}</Badge> },
    { key: "creator", title: "Người phân công", render: (row) => row.assigned_by?.username || "-" },
    { key: "createdAt", title: "Ngày tạo", render: (row) => row.is_unassigned ? "-" : formatDateTime(row.createdAt || row.created_at) },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          {row.is_unassigned ? (
            canWrite && (
              <Button
                variant="primary"
                onClick={() => {
                  openCreate(true);
                  changeClass(row.class_id._id);
                }}
              >
                {isHead ? "Đề xuất" : "Phân công"}
              </Button>
            )
          ) : (
            <>
              {canViewHistory && <Button variant="outline" onClick={() => openHistory(row)}>Lịch sử</Button>}
              {isAdmin && row.status === "PENDING" && <Button variant="primary" onClick={() => approve(row)}>Duyệt</Button>}
              {canWrite && <Button variant="outline" onClick={() => openChangeLecturer(row)}>Sửa</Button>}
              {isAdmin && <Button variant="danger" onClick={() => remove(row)}>Xóa</Button>}
            </>
          )}
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
    { key: "preferences", title: "Nguyện vọng" },
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
    { key: "class", title: "Lớp", render: (row) => row.assignment_id?.class_id?.code || selectedAssignment?.class_id?.code || "N/A" },
    { key: "course", title: "Môn học", render: (row) => row.assignment_id?.class_id?.course_id?.name || selectedAssignment?.class_id?.course_id?.name || "N/A" },
    { key: "semester", title: "Học kỳ", render: (row) => row.assignment_id?.class_id?.semester_id?.name || selectedAssignment?.class_id?.semester_id?.name || "N/A" },
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
            {isHead && (
              <Button
                variant="outline"
                style={{ borderColor: "#10b981", color: "#10b981", fontWeight: 600 }}
                onClick={autoAssignAll}
              >
                Phân công tự động
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)", fontWeight: 600 }}
                onClick={() => navigate?.("/assignments/approval")}
              >
                Duyệt đề xuất (Pending)
              </Button>
            )}
            {canWrite && <Button onClick={() => openCreate(false)}>{isHead ? "Đề xuất phân công" : "Thêm phân công"}</Button>}
            {canViewHistory && <Button variant="outline" onClick={openGlobalHistory}>Lịch sử thay đổi</Button>}
            <Button variant="outline" onClick={load}>Làm mới</Button>
          </div>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#334155", whiteSpace: "nowrap" }}> Lọc theo học kỳ:</label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", minWidth: "220px", backgroundColor: "#fff" }}
          >
            <option value="">Tất cả học kỳ</option>
            {semesters.map((s) => <option key={s._id} value={s._id}>{s.name}{s.status === "ACTIVE" ? " ⚡" : ""}</option>)}
          </select>
        </div>
        {message && <div className="alert success" style={{ marginBottom: "16px", background: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "6px" }}>{message}</div>}
        {error && !modal && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={tableRows} loading={loading} />
      </Card>

      {(modal === "Thêm phân công" || modal === "Đề xuất phân công") && (
        <Modal title={modal} onClose={() => setModal("")}>
          <form className="form-grid" onSubmit={submitCreate}>
            <Select label="Lớp tín chỉ" value={form.class_id} onChange={(event) => changeClass(event.target.value)} required disabled={isFixedClass}>
              <option value="">Chọn lớp</option>
              {availableClasses.map((item) => (
                <option key={item._id} value={item._id}>{item.code} - {item.course_id?.name || "N/A"}</option>
              ))}
            </Select>
            <label className="field wide">
              <span>Lịch học của lớp</span>
              <div className="alert">
                {schedules.length ? schedules.map(scheduleText).join("; ") : form.class_id ? "Chưa có lịch học (Hệ thống tính tải theo số tín chỉ môn học)" : "Vui lòng chọn lớp tín chỉ"}
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
              <span>Ghi chú <span style={{ color: "#ef4444" }}>*</span> (Bắt buộc nhập lý do đổi giảng viên)</span>
              <textarea className="uis-input" placeholder="Nhập lý do thay đổi..." value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} required />
            </label>
            {error && <div className="alert danger">{error}</div>}
            <Button className="form-submit" type="submit" disabled={!form.note || !form.note.trim()}>Lưu thay đổi</Button>
          </form>
        </Modal>
      )}

      {modal === "Lịch sử phân công" && (
        <Modal title={selectedAssignment ? `Lịch sử thay đổi: ${selectedAssignment?.class_id?.code || ""}` : "Lịch sử thay đổi phân công (Toàn bộ)"} onClose={() => setModal("")}>
          {error && <div className="alert danger">{error}</div>}
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#64748b", fontSize: "14px" }}>
              Chưa có lịch sử thay đổi phân công nào.
            </div>
          ) : (
            <div style={{ padding: "8px 12px", maxHeight: "480px", overflowY: "auto" }}>
              <div style={{ position: "relative", borderLeft: "2px solid #3b82f6", marginLeft: "8px", paddingLeft: "20px" }}>
                {history.map((item, idx) => (
                  <div key={item._id || idx} style={{ position: "relative", marginBottom: "20px" }}>
                    <div style={{
                      position: "absolute",
                      left: "-26px",
                      top: "4px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#3b82f6",
                      border: "2px solid #ffffff",
                      boxShadow: "0 0 0 2px #3b82f6"
                    }} />
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                       {formatDateTime(item.changed_at)}
                    </div>
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", position: "relative" }}>
                      {isAdmin && (
                        <button
                          type="button"
                          title="Xóa bản ghi lịch sử này"
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                          onClick={() => removeHistoryItem(item._id)}
                        >
                           Xóa
                        </button>
                      )}
                      {!selectedAssignment && (
                        <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: "bold", marginBottom: "6px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "4px", paddingRight: "50px" }}>
                          Lớp: {item.assignment_id?.class_id?.code || "N/A"} {item.assignment_id?.class_id?.course_id?.name ? `(${item.assignment_id.class_id.course_id.name})` : ""}
                        </div>
                      )}
                      <div style={{ fontSize: "14px", color: "#1e293b", marginBottom: "6px" }}>
                        <span>GV cũ: </span>
                        <strong style={{ color: "#ef4444" }}>{item.old_lecturer_id?.name || item.old_lecturer?.name || "Chưa có"}</strong>
                        {"  "}
                        <span>GV mới: </span>
                        <strong style={{ color: "#10b981" }}>{item.new_lecturer_id?.name || item.new_lecturer?.name || "N/A"}</strong>
                      </div>
                      <div style={{ fontSize: "13px", color: "#475569", marginBottom: item.reason ? "6px" : "0" }}>
                         <strong>Người thực hiện:</strong> {item.changed_by?.name || item.changed_by?.username || item.changed_by_name || "Quản trị viên"}
                      </div>
                      {item.reason && (
                        <div style={{ fontSize: "13px", color: "#334155", backgroundColor: "#f1f5f9", padding: "6px 10px", borderRadius: "4px", fontStyle: "italic", borderLeft: "3px solid #64748b" }}>
                           <strong>Lý do:</strong> {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
