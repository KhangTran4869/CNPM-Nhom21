import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { assignmentService } from "../services/assignmentService";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const errorText = (err) =>
  err.payload?.errors
    ?.map((item) => item.message || item.rule || item)
    .join(", ") ||
  err.message ||
  "Thao tác không thành công";

export function AssignmentApprovalPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    assignmentService
      .getAssignments({ status: "PENDING" })
      .then(setAssignments)
      .catch((err) => {
        setAssignments([]);
        setError(errorText(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (assignment) => {
    setActionLoading(assignment._id);
    setError("");
    try {
      await assignmentService.approveAssignment(assignment._id, {});
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setActionLoading("");
    }
  };

  const openReject = (assignment) => {
    setSelectedAssignment(assignment);
    setRejectNote("");
    setError("");
  };

  const closeReject = () => {
    setSelectedAssignment(null);
    setRejectNote("");
  };

  const reject = async (event) => {
    event.preventDefault();
    if (!selectedAssignment) return;

    setActionLoading(selectedAssignment._id);
    setError("");
    try {
      await assignmentService.rejectAssignment(selectedAssignment._id, {
        note: rejectNote.trim(),
      });
      closeReject();
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setActionLoading("");
    }
  };

  const columns = [
    { key: "class", title: "Lớp", render: (row) => row.class_id?.code || "N/A" },
    { key: "course", title: "Môn học", render: (row) => row.class_id?.course_id?.name || "N/A" },
    { key: "semester", title: "Học kỳ", render: (row) => row.class_id?.semester_id?.name || "N/A" },
    { key: "lecturer", title: "Giảng viên đề xuất", render: (row) => row.lecturer_id?.name || "N/A" },
    { key: "creator", title: "Người đề xuất", render: (row) => row.assigned_by?.username || "N/A" },
    { key: "createdAt", title: "Ngày đề xuất", render: (row) => formatDateTime(row.createdAt || row.created_at) },
    { key: "note", title: "Ghi chú", render: (row) => row.note || "N/A" },
    { key: "status", title: "Trạng thái", render: () => <Badge>PENDING</Badge> },
    {
      key: "actions",
      title: "Duyệt",
      render: (row) => (
        <div className="row-actions">
          <Button
            onClick={() => approve(row)}
            disabled={actionLoading === row._id}
          >
            Duyệt
          </Button>
          <Button
            variant="danger"
            onClick={() => openReject(row)}
            disabled={actionLoading === row._id}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card
        title="Duyệt phân công"
        actions={<Button variant="outline" onClick={load}>Làm mới</Button>}
      >
        {error && !selectedAssignment && <div className="alert danger">{error}</div>}
        <Table
          columns={columns}
          rows={assignments}
          loading={loading}
          emptyText="Không có phân công đang chờ duyệt"
        />
      </Card>

      {selectedAssignment && (
        <Modal title="Từ chối phân công" onClose={closeReject}>
          <form className="form-grid" onSubmit={reject}>
            <label className="field">
              <span>Lớp tín chỉ</span>
              <div className="alert">{selectedAssignment.class_id?.code || "N/A"}</div>
            </label>
            <label className="field">
              <span>Giảng viên đề xuất</span>
              <div className="alert">{selectedAssignment.lecturer_id?.name || "N/A"}</div>
            </label>
            <label className="field wide">
              <span>Lý do từ chối</span>
              <textarea
                className="uis-input"
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                required
              />
            </label>
            {error && <div className="alert danger">{error}</div>}
            <div className="form-actions">
              <Button
                variant="danger"
                type="submit"
                disabled={actionLoading === selectedAssignment._id}
              >
                Xác nhận từ chối
              </Button>
              <Button variant="outline" type="button" onClick={closeReject}>
                Hủy
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
