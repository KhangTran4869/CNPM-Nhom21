import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { assignmentService } from "../services/assignmentService";
import { classService } from "../services/classService";
import { lecturerService } from "../services/lecturerService";

export function AssignmentsPage({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [checkResult, setCheckResult] = useState(null);
  const [modal, setModal] = useState("");
  const [form, setForm] = useState({ class_id: "", lecturer_id: "", status: "PENDING", note: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canWrite = user?.role === "ADMIN" || user?.role === "HEAD";
  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    assignmentService.getAssignments().then(setAssignments).catch(() => setAssignments([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    classService.getClasses().then(setClasses).catch(() => setClasses([]));
    lecturerService.getLecturers().then(setLecturers).catch(() => setLecturers([]));
  }, []);

  const check = async () => {
    const result = await assignmentService.checkAssignment(form);
    setCheckResult(result);
  };

  const openSuggest = async (classId) => {
    setModal("Gợi ý giảng viên");
    setForm({ ...form, class_id: classId });
    const data = await classService.getSuggestedLecturers(classId);
    setSuggestions(data);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isAdmin) await assignmentService.createAssignment(form);
      else await assignmentService.proposeAssignment(form);
      setModal("");
      setCheckResult(null);
      load();
    } catch (err) {
      setError(err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") || err.message);
    }
  };

  const approve = async (id) => {
    setError("");
    try {
      await assignmentService.approveAssignment(id, { note: "Phân công hợp lệ" });
      load();
    } catch (err) {
      setError(err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") || err.message);
    }
  };

  const reject = async (id) => {
    const note = window.prompt("Lý do từ chối?");
    if (note) {
      await assignmentService.rejectAssignment(id, { note });
      load();
    }
  };

  const columns = [
    { key: "class", title: "Mã lớp", render: (row) => row.class_id?.code || "N/A" },
    { key: "course", title: "Môn học", render: (row) => row.class_id?.course_id?.name || "N/A" },
    { key: "lecturer", title: "Giảng viên", render: (row) => row.lecturer_id?.name || "N/A" },
    { key: "room", title: "Phòng", render: () => "Xem lịch" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{String(row.status || "").toUpperCase()}</Badge> },
    { key: "creator", title: "Người tạo", render: (row) => row.assigned_by?.username || "N/A" },
    { key: "note", title: "Ghi chú" },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          {canWrite && <Button variant="outline" onClick={() => openSuggest(row.class_id?._id)}>Gợi ý</Button>}
          {isAdmin && String(row.status || "").toUpperCase() === "PENDING" && <Button onClick={() => approve(row._id)}>Duyệt</Button>}
          {isAdmin && String(row.status || "").toUpperCase() === "PENDING" && <Button variant="danger" onClick={() => reject(row._id)}>Từ chối</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card title="Phân công giảng viên" actions={canWrite && <Button onClick={() => setModal("Tạo phân công")}>{isAdmin ? "Tạo phân công" : "Đề xuất phân công"}</Button>}>
        {error && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={assignments} loading={loading} />
      </Card>
      <Modal title={modal} onClose={() => setModal("")}>
        {modal === "Gợi ý giảng viên" ? (
          <Table
            columns={[
              { key: "code", title: "Mã GV" },
              { key: "name", title: "Họ tên" },
              { key: "degree", title: "Học vị" },
              { key: "department", title: "Bộ môn" },
              { key: "current_hours", title: "Giờ hiện tại" },
              { key: "max_hours", title: "Max hours" },
              { key: "available_hours", title: "Còn lại" },
              { key: "is_valid", title: "Hợp lệ", render: (row) => row.is_valid ? "Có" : "Không" },
              { key: "reasons", title: "Lý do", render: (row) => row.reasons?.join(", ") },
              { key: "actions", title: "Hành động", render: (row) => <Button disabled={!row.is_valid} onClick={() => setForm({ ...form, lecturer_id: row.lecturer_id })}>Chọn</Button> },
            ]}
            rows={suggestions}
          />
        ) : (
          <form className="form-grid" onSubmit={submit}>
            <Select label="Lớp tín chỉ" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
              <option value="">Chọn lớp</option>
              {classes.map((item) => <option key={item._id} value={item._id}>{item.code}</option>)}
            </Select>
            <Select label="Giảng viên" value={form.lecturer_id} onChange={(e) => setForm({ ...form, lecturer_id: e.target.value })}>
              <option value="">Chọn giảng viên</option>
              {lecturers.map((item) => <option key={item._id} value={item._id}>{item.code} - {item.name}</option>)}
            </Select>
            {isAdmin && (
              <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
              </Select>
            )}
            <label className="field wide">
              <span>Ghi chú</span>
              <textarea className="uis-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </label>
            {checkResult && <div className={`alert ${checkResult.is_valid ? "success" : "danger"}`}>{checkResult.is_valid ? "Giảng viên phù hợp để phân công" : checkResult.violations?.map((item) => item.rule || item).join(", ")}</div>}
            {error && <div className="alert danger">{error}</div>}
            <div className="form-actions">
              <Button variant="outline" onClick={check}>Kiểm tra</Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
