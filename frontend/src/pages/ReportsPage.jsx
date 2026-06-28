import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Table } from "../components/ui/Table";
import { catalogService } from "../services/catalogService";
import { lecturerService } from "../services/lecturerService";
import { reportService } from "../services/reportService";

const permissionMessage = "Bạn không có quyền xem báo cáo này";

const getErrorMessage = (err) => {
  if (err?.status === 403) return permissionMessage;
  return (
    err?.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") ||
    err?.message ||
    "Không thể tải báo cáo"
  );
};

export function ReportsPage({ user }) {
  const isLecturer = user?.role === "LECTURER";
  const isAdmin = user?.role === "ADMIN";
  const [tab, setTab] = useState("assignments");
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogService.getSemesters().then((data) => {
      setSemesters(data);
      setSemesterId(data[0]?._id || "");
    }).catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    if (isLecturer && tab !== "workloads") {
      setTab("workloads");
    }
  }, [isLecturer, tab]);

  useEffect(() => {
    if (!semesterId) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isLecturer) {
          if (!user?.lecturer_id) {
            setRows([]);
            setError("Tài khoản chưa liên kết với hồ sơ giảng viên");
            return;
          }

          const workload = await lecturerService.getLecturerWorkload(user.lecturer_id, {
            semester_id: semesterId,
          });
          setRows([
            {
              ...workload,
              code: user.code,
              name: user.name || user.username,
              department: user.department,
            },
          ]);
          return;
        }

        const data =
          tab === "assignments"
            ? await reportService.getAssignmentReport({ semester_id: semesterId })
            : await reportService.getLecturerWorkloads({ semester_id: semesterId });
        setRows(data);
      } catch (err) {
        console.error("Không thể tải báo cáo", err);
        setRows([]);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLecturer, semesterId, tab, user]);

  const exportReport = async (format) => {
    setError("");
    try {
      const data = await reportService.exportAssignmentReport({ semester_id: semesterId, format });
      alert(data.download_url);
    } catch (err) {
      console.error("Không thể xuất báo cáo", err);
      setError(getErrorMessage(err));
    }
  };

  const columns = !isLecturer && tab === "assignments"
    ? [
        { key: "class", title: "Mã lớp", render: (row) => row.class_id?.code },
        { key: "course", title: "Môn học", render: (row) => row.class_id?.course_id?.name },
        { key: "lecturerCode", title: "Mã GV", render: (row) => row.lecturer_id?.code },
        { key: "lecturer", title: "Tên GV", render: (row) => row.lecturer_id?.name },
        { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
      ]
    : [
        { key: "code", title: "Mã GV" },
        { key: "name", title: "Họ tên" },
        { key: "department", title: "Bộ môn" },
        { key: "total_hours", title: "Tổng số tiết" },
        { key: "max_hours", title: "Max hours" },
        { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
      ];

  return (
    <Card
      title={isLecturer ? "Khối lượng giảng dạy của tôi" : "Báo cáo thống kê"}
      actions={!isLecturer && isAdmin && tab === "assignments" && (
        <div className="row-actions">
          <Button variant="outline" onClick={() => exportReport("excel")}>Xuất Excel</Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>Xuất PDF</Button>
        </div>
      )}
    >
      <div className="tabs">
        {!isLecturer && (
          <Button variant={tab === "assignments" ? "primary" : "outline"} onClick={() => setTab("assignments")}>Danh sách phân công</Button>
        )}
        <Button variant={tab === "workloads" ? "primary" : "outline"} onClick={() => setTab("workloads")}>Khối lượng giảng dạy</Button>
      </div>
      <div className="filter-row">
        <Select label="Học kỳ" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
          {semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </Select>
      </div>
      {error && <div className="alert danger">{error}</div>}
      <Table columns={columns} rows={rows} loading={loading} />
    </Card>
  );
}
