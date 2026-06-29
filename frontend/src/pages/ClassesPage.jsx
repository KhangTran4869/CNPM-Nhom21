import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { catalogService } from "../services/catalogService";
import { classService } from "../services/classService";

const scheduleTypeOptions = [
  { value: "THEORY", label: "Lý thuyết" },
  { value: "PRACTICE", label: "Thực hành" },
];

const scheduleTypeLabel = (value) =>
  scheduleTypeOptions.find((item) => item.value === String(value || "THEORY").toUpperCase())?.label || "Lý thuyết";

const initialForm = {
  _id: "",
  code: "",
  course_id: "",
  semester_id: "",
  max_students: 80,
};

const initialScheduleForm = {
  _id: "",
  class_id: "",
  day_of_week: 2,
  start_period: 1,
  end_period: 3,
  room_id: "",
  session_type: "THEORY",
  group_code: "",
};

export function ClassesPage({ user }) {
  const [classes, setClasses] = useState([]);
  const [catalog, setCatalog] = useState({ courses: [], semesters: [], rooms: [] });
  const [filters, setFilters] = useState({ keyword: "", semester_id: "", course_id: "", status: "" });
  const [form, setForm] = useState(initialForm);
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    classService.getClasses(filters).then(setClasses).catch(() => setClasses([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([catalogService.getCourses(), catalogService.getSemesters(), catalogService.getRooms()])
      .then(([courses, semesters, rooms]) => setCatalog({ courses, semesters, rooms }))
      .catch(() => setCatalog({ courses: [], semesters: [], rooms: [] }));
  }, []);

  useEffect(load, [filters]);

  const saveClass = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.code.trim()) {
      setError("Mã lớp không được để trống");
      return;
    }
    if (!form.course_id) {
      setError("Vui lòng chọn môn học");
      return;
    }
    if (!form.semester_id) {
      setError("Vui lòng chọn học kỳ");
      return;
    }
    if (isNaN(form.max_students) || Number(form.max_students) < 25) {
      setError("Số sinh viên tối đa tối thiểu phải từ 25 sinh viên");
      return;
    }
    try {
      if (form._id) {
        await classService.updateClass(form._id, {
          code: form.code.trim(),
          course_id: form.course_id,
          semester_id: form.semester_id,
          max_students: Number(form.max_students),
        });
      } else {
        await classService.createClass({
          code: form.code.trim(),
          course_id: form.course_id,
          semester_id: form.semester_id,
          max_students: Number(form.max_students),
        });
      }
      setModal("");
      load();
    } catch (err) {
      const errorMap = {
        CLASS_CODE_EXISTS: "Mã lớp tín chỉ này đã tồn tại trong hệ thống.",
        CODE_REQUIRED: "Mã lớp tín chỉ không được để trống.",
        MAX_STUDENTS_INVALID: "Số sinh viên tối đa phải lớn hơn 0.",
        MAX_STUDENTS_MIN_25: "Số sinh viên tối đa tối thiểu phải từ 25 sinh viên.",
        ROOM_CAPACITY_EXCEEDED: err.payload?.errors?.[0]?.message || "Phòng học không đủ sức chứa cho sĩ số mới.",
        ASSIGNMENT_LOCKED: "Không thể chỉnh sửa do lớp đã có phân công chính thức.",
      };
      setError(err.payload?.errors?.map((item) => errorMap[item] || item.message || item.rule || item).join(", ") || err.message);
    }
  };

  const saveSchedule = async (event) => {
    event.preventDefault();
    setError("");
    if (Number(scheduleForm.day_of_week) < 2 || Number(scheduleForm.day_of_week) > 8) {
      setError("Thứ phải từ Thứ 2 đến Chủ nhật (8)");
      return;
    }
    if (Number(scheduleForm.start_period) <= 0 || Number(scheduleForm.end_period) < Number(scheduleForm.start_period)) {
      setError("Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu (từ tiết 1)");
      return;
    }
    if (!scheduleForm.room_id) {
      setError("Vui lòng chọn phòng học");
      return;
    }
    try {
      if (scheduleForm._id) {
        await classService.updateSchedule(scheduleForm._id, scheduleForm);
      } else {
        await classService.createClassSchedule(scheduleForm.class_id, scheduleForm);
      }
      if (selectedClass?._id === scheduleForm.class_id) {
        const data = await classService.getClassSchedules(scheduleForm.class_id);
        setSchedules(data);
      }
      setModal("");
      // Tải lại danh sách lớp bên ngoài để cập nhật con số lịch học (schedule_count) mới nhất
      load();
    } catch (err) {
      const errorMap = {
        ASSIGNMENT_LOCKED: "Lớp học đã được duyệt phân công giảng viên. Vui lòng thu hồi phân công trước khi thay đổi lịch học.",
        ROOM_CAPACITY_INVALID: err.payload?.errors?.[0]?.message || "Sức chứa của phòng học không đủ cho số lượng sinh viên tối đa của lớp.",
        ROOM_NOT_FOUND: "Phòng học không tồn tại hoặc đã bị xóa.",
        SCHEDULE_NOT_FOUND: "Lịch học không tồn tại.",
      };
      setError(err.payload?.errors?.map((item) => errorMap[item] || item.message || item.rule || item).join(", ") || err.message);
    }
  };

  const openSchedules = async (classItem) => {
    setSelectedClass(classItem);
    setSchedules([]);
    setModal(`Lịch học lớp ${classItem.code}`);
    const data = await classService.getClassSchedules(classItem._id).catch(() => []);
    setSchedules(data);
  };

  const openEditSchedule = (schedule) => {
    setScheduleForm({
      _id: schedule._id,
      class_id: schedule.class_id?._id || schedule.class_id || selectedClass?._id || "",
      day_of_week: Number(schedule.day_of_week || 2),
      start_period: Number(schedule.start_period || 1),
      end_period: Number(schedule.end_period || 3),
      room_id: schedule.room_id?._id || schedule.room_id || "",
      session_type: String(schedule.session_type || "THEORY").toUpperCase(),
      group_code: schedule.group_code || "",
    });
    setError("");
    setModal("Sửa lịch học");
  };

  const columns = [
    { key: "code", title: "Mã lớp" },
    { key: "course", title: "Môn học", render: (row) => row.course_id?.name || "Chưa cập nhật" },
    { key: "semester", title: "Học kỳ", render: (row) => row.semester_id?.name || "Chưa cập nhật" },
    { key: "max_students", title: "Số SV tối đa" },
    {
      key: "lecturer",
      title: "Giảng viên phụ trách",
      render: (row) => {
        if (row.assigned_lecturer) {
          return (
            <div>
              <strong style={{ color: "#0369a1" }}>{row.assigned_lecturer}</strong>
              {row.assignment_status === "PENDING" && (
                <span style={{ display: "block", fontSize: "0.8rem", color: "#d97706" }}>⏳ Đang chờ duyệt</span>
              )}
            </div>
          );
        }
        return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa phân công</span>;
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (row) => {
        if (row.status === "CANCELLED") {
          return <Badge style={{ background: "#64748b", color: "#fff" }}>ĐÃ HỦY</Badge>;
        }
        if (row.status === "ACTIVE") {
          return <Badge style={{ background: "#3b82f6", color: "#fff" }}>ĐANG HỌC</Badge>;
        }
        if (row.status === "COMPLETED") {
          return <Badge style={{ background: "#10b981", color: "#fff" }}>ĐÃ KẾT THÚC</Badge>;
        }
        return <Badge>{row.status}</Badge>;
      },
    },
    {
      key: "schedule",
      title: "Lịch học",
      render: (row) => (
        <Button variant="outline" onClick={() => openSchedules(row)}>
          {row.schedule_count > 0 ? `Xem lịch (${row.schedule_count})` : "Chưa có lịch"}
        </Button>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => {
        if (!isAdmin) return null;
        if (row.status === "CANCELLED") {
          return <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Lớp đã hủy</span>;
        }
        if (row.status === "ACTIVE") {
          return <span style={{ fontStyle: "italic", color: "#3b82f6", fontWeight: 500 }}>📖 Đang giảng dạy (Khóa thao tác)</span>;
        }
        if (row.status === "COMPLETED") {
          return <span style={{ fontStyle: "italic", color: "#10b981", fontWeight: 500 }}>🏁 Đã kết thúc (Lưu trữ lịch sử)</span>;
        }

        const isAssigned = row.assignment_status === "APPROVED" || row.status === "ASSIGNED";

        return (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {isAssigned ? (
              <Button variant="outline" style={{ borderColor: "#d97706", color: "#d97706" }} onClick={async () => {
                if (window.confirm(`Bạn có muốn rút lại (thu hồi) quyết định phân công giảng viên của lớp "${row.code}" không? (Sau khi thu hồi, lớp sẽ chuyển về trạng thái Chưa phân công để có thể chỉnh sửa)`)) {
                  try {
                    if (row.assignment_id) {
                      await classService.revokeAssignment(row.assignment_id);
                    } else {
                      await classService.updateClassStatus(row._id, { status: "OPEN" });
                    }
                    load();
                  } catch (err) {
                    alert(err.payload?.errors?.map((item) => item.message || item).join(", ") || err.message || "Lỗi khi thu hồi phân công");
                  }
                }
              }}>Thu hồi</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setForm({
                    _id: row._id,
                    code: row.code || "",
                    course_id: row.course_id?._id || row.course_id || "",
                    semester_id: row.semester_id?._id || row.semester_id || "",
                    max_students: row.max_students ?? 80,
                  });
                  setError("");
                  setModal("Sửa lớp tín chỉ");
                }}>Sửa lớp</Button>

                {!row.schedule_count || row.schedule_count === 0 ? (
                  <Button variant="outline" style={{ borderColor: "#0284c7", color: "#0284c7" }} onClick={() => {
                    setScheduleForm({ ...initialScheduleForm, class_id: row._id });
                    setError("");
                    setModal("Thêm lịch học");
                  }}>Thêm lịch</Button>
                ) : (
                  <Button variant="outline" style={{ borderColor: "#16a34a", color: "#16a34a" }} onClick={() => openSchedules(row)}>Sửa lịch</Button>
                )}

                {(() => {
                  const isSemesterActiveOrEnded = row.semester_id?.start_date && new Date() >= new Date(row.semester_id.start_date);
                  return (
                    <Button
                      variant="outline"
                      style={{ borderColor: isSemesterActiveOrEnded ? "#94a3b8" : "#ef4444", color: isSemesterActiveOrEnded ? "#94a3b8" : "#ef4444" }}
                      disabled={isSemesterActiveOrEnded}
                      title={isSemesterActiveOrEnded ? "Không thể xóa lớp thuộc học kỳ đang diễn ra hoặc đã kết thúc" : ""}
                      onClick={async () => {
                        if (window.confirm(`Bạn có chắc chắn muốn XÓA lớp tín chỉ "${row.code}" không?`)) {
                          try {
                            await classService.deleteClass(row._id);
                            load();
                          } catch (err) {
                            alert(err.payload?.errors?.map((item) => item.message || item).join(", ") || err.message || "Lỗi khi xóa lớp");
                          }
                        }
                      }}
                    >
                      Xóa lớp
                    </Button>
                  );
                })()}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Quản lý lớp tín chỉ</h1>
        {isAdmin && <Button onClick={() => { setForm(initialForm); setError(""); setModal("Tạo lớp tín chỉ"); }}>Tạo lớp tín chỉ</Button>}
      </div>
      <Card className="filter-card">
        <div className="filter-row">
          <Input label="Tìm mã lớp" placeholder="Nhập mã..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
          <Select label="Học kỳ" value={filters.semester_id} onChange={(e) => setFilters({ ...filters, semester_id: e.target.value })}>
            <option value="">Tất cả</option>
            {catalog.semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Select label="Môn học" value={filters.course_id} onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}>
            <option value="">Tất cả</option>
            {catalog.courses.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
        </div>
      </Card>
      <Table columns={columns} rows={classes} loading={loading} />
      <Modal open={Boolean(modal)} title={modal} onClose={() => setModal("")}>
        {modal === "Tạo lớp tín chỉ" || modal === "Sửa lớp tín chỉ" ? (
          <form className="form-grid" onSubmit={saveClass}>
            {error && <div className="alert danger">{error}</div>}
            <Input label="Mã lớp" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Select label="Môn học" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Chọn môn</option>
              {catalog.courses.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Select label="Học kỳ" value={form.semester_id} onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
              <option value="">Chọn học kỳ</option>
              {catalog.semesters.filter((item) => ["PLANNING", "UPCOMING"].includes(item.status)).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Input label="Số SV tối đa" type="number" min="25" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: e.target.value })} />
            <Button className="form-submit" type="submit">Lưu</Button>
          </form>
        ) : modal === "Thêm lịch học" || modal === "Sửa lịch học" ? (
          <form className="form-grid" onSubmit={saveSchedule}>
            {error && <div className="alert danger">{error}</div>}
            <Input label="Thứ" type="number" min="2" max="8" value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })} />
            <Input label="Tiết bắt đầu" type="number" min="1" max="15" value={scheduleForm.start_period} onChange={(e) => setScheduleForm({ ...scheduleForm, start_period: e.target.value })} />
            <Input label="Tiết kết thúc" type="number" min="1" max="15" value={scheduleForm.end_period} onChange={(e) => setScheduleForm({ ...scheduleForm, end_period: e.target.value })} />
            <Select label="Loại buổi học" value={scheduleForm.session_type} onChange={(e) => setScheduleForm({ ...scheduleForm, session_type: e.target.value })}>
              {scheduleTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
            <Input label="Nhóm thực hành" value={scheduleForm.group_code} onChange={(e) => setScheduleForm({ ...scheduleForm, group_code: e.target.value })} placeholder="Ví dụ: 01, 02" />
            <Select label="Phòng" value={scheduleForm.room_id} onChange={(e) => setScheduleForm({ ...scheduleForm, room_id: e.target.value })}>
              <option value="">Chọn phòng</option>
              {catalog.rooms.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Button className="form-submit" type="submit">{scheduleForm._id ? "Lưu thay đổi" : "Lưu lịch"}</Button>
          </form>
        ) : (
          <div className="page-stack">
            {error && <div className="alert danger">{error}</div>}
            <Table
              columns={[
                { key: "day_of_week", title: "Thứ" },
                { key: "session_type", title: "Loại buổi", render: (row) => scheduleTypeLabel(row.session_type) },
                { key: "group_code", title: "Nhóm", render: (row) => row.group_code || "N/A" },
                { key: "period", title: "Tiết", render: (row) => `${row.start_period} - ${row.end_period}` },
                { key: "room", title: "Phòng", render: (row) => row.room_id?.name || "N/A" },
                {
                  key: "actions",
                  title: "Hành động",
                  render: (row) => {
                    if (!isAdmin) return null;
                    const isSelectedLocked = selectedClass && (
                      selectedClass.assignment_status === "APPROVED" ||
                      selectedClass.status === "ASSIGNED" ||
                      selectedClass.status === "ACTIVE" ||
                      selectedClass.status === "COMPLETED" ||
                      selectedClass.status === "CANCELLED"
                    );
                    if (isSelectedLocked) {
                      const msg = selectedClass.status === "CANCELLED" ? "Lớp đã hủy" : (selectedClass.status === "ACTIVE" || selectedClass.status === "COMPLETED") ? "Đã chốt lịch" : "Thu hồi để sửa";
                      return <span style={{ fontStyle: "italic", color: "#d97706", fontSize: "0.85rem" }}>🔒 Đã khóa ({msg})</span>;
                    }
                    return (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Button variant="outline" onClick={() => openEditSchedule(row)}>Sửa</Button>
                        <Button variant="outline" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={async () => {
                          if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
                            try {
                              await classService.deleteSchedule(row._id);
                              const data = await classService.getClassSchedules(selectedClass._id);
                              setSchedules(data);
                              load();
                            } catch (err) {
                              setError(err.payload?.errors?.map((item) => item.message || item).join(", ") || err.message);
                            }
                          }
                        }}>Xóa</Button>
                      </div>
                    );
                  },
                },
              ]}
              rows={schedules}
            />
            {isAdmin && selectedClass && (
              (selectedClass.assignment_status === "APPROVED" || selectedClass.status === "ASSIGNED" || selectedClass.status === "ACTIVE" || selectedClass.status === "COMPLETED" || selectedClass.status === "CANCELLED") ? (
                <div className="alert warning" style={{ background: "#fef3c7", color: "#92400e", padding: "12px", borderRadius: "6px", textAlign: "center", fontSize: "0.9rem", border: "1px solid #f59e0b" }}>
                  🔒 <b>{selectedClass.status === "CANCELLED" ? "Lớp tín chỉ này đã bị HỦY." : selectedClass.status === "ACTIVE" ? "Môn học đang diễn ra trong học kỳ." : selectedClass.status === "COMPLETED" ? "Môn học đã kết thúc học kỳ." : "Lớp tín chỉ đã được phân công giảng viên."}</b><br/>
                  {selectedClass.status === "CANCELLED" ? "Toàn bộ thao tác thêm, sửa hoặc xóa thời khóa biểu đều bị khóa." : (selectedClass.status === "ACTIVE" || selectedClass.status === "COMPLETED") ? "Thời khóa biểu đã được chốt cố định và khóa bảo vệ." : "Vui lòng nhấn nút [Thu hồi] ở danh sách lớp ngoài trang chủ để gỡ giảng viên trước khi thêm hoặc sửa lịch học!"}
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setScheduleForm({ ...initialScheduleForm, class_id: selectedClass._id });
                    setModal("Thêm lịch học");
                  }}
                >
                  Thêm lịch học
                </Button>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
