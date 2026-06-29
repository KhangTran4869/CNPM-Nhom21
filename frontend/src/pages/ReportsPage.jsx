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
  const [summary, setSummary] = useState(null);
  const [lecturerStats, setLecturerStats] = useState(null);
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
          let lid = user?.lecturer_id;
          if (!lid && user?.username) {
            try {
              const allLecs = await lecturerService.getLecturers();
              const found = (allLecs || []).find(l => l.code?.toLowerCase() === user.username?.toLowerCase() || l.name === user.name);
              lid = found?._id;
            } catch (e) {}
          }
          if (!lid) {
            setRows([]);
            setError("Tài khoản chưa liên kết với hồ sơ giảng viên");
            return;
          }

          const [workload, schedule] = await Promise.all([
            lecturerService.getLecturerWorkload(lid, { semester_id: semesterId }).catch(() => ({ total_hours: 0, max_hours: 120, status: "NORMAL" })),
            lecturerService.getTeachingSchedule(lid, { semester_id: semesterId }).catch(() => [])
          ]);

          setLecturerStats(workload);
          setRows(schedule || []);
          return;
        }

        if (tab === "assignments") {
          const [data, sumData] = await Promise.all([
            reportService.getAssignmentReport({ semester_id: semesterId }),
            reportService.getAssignmentSummary({ semester_id: semesterId }).catch(() => null)
          ]);
          setRows(data);
          setSummary(sumData);
        } else {
          const data = await reportService.getLecturerWorkloads({ semester_id: semesterId });
          setRows(data);
          setSummary(null);
        }
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
      const data = tab === "assignments"
        ? await reportService.exportAssignmentReport({ semester_id: semesterId, format })
        : await reportService.exportLecturerWorkloads({ semester_id: semesterId, format });
      alert(data.download_url);
    } catch (err) {
      console.error("Không thể xuất báo cáo", err);
      setError(getErrorMessage(err));
    }
  };

  const columns = isLecturer
    ? [
        { key: "classCode", title: "Mã lớp tín chỉ", render: (row) => row.class_id?.code || "N/A" },
        { key: "courseName", title: "Tên môn học", render: (row) => row.class_id?.course_id?.name || "N/A" },
        { key: "credits", title: "Số tín chỉ", render: (row) => row.class_id?.course_id?.credits || 3 },
        { key: "hours", title: "Khối lượng giờ", render: (row) => `${row.class_id?.course_id?.total_hours || (row.class_id?.course_id?.credits || 3) * 15} giờ chuẩn` },
        { key: "status", title: "Trạng thái", render: (row) => (
          <Badge variant={row.status === "APPROVED" ? "success" : row.status === "PROPOSED" ? "warning" : "default"}>
            {row.status === "APPROVED" ? "Đã duyệt" : row.status === "PROPOSED" ? "Đề xuất" : row.status}
          </Badge>
        )}
      ]
    : tab === "assignments"
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
        { key: "total_hours", title: "Khối lượng (giờ)" },
        { key: "max_hours", title: "Số giờ tối đa" },
        { key: "status", title: "Trạng thái", render: (row) => {
          const variant = row.status === "Thiếu giờ" ? "danger" : row.status === "Vượt tải" ? "warning" : "success";
          return <Badge variant={variant}>{row.status}</Badge>;
        }},
      ];

  return (
    <Card
      title={isLecturer ? "Khối lượng giảng dạy của tôi" : "Báo cáo thống kê"}
      actions={!isLecturer && isAdmin && (
        <div className="row-actions">
          <Button variant="outline" onClick={() => exportReport("excel")}>Xuất Excel</Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>Xuất PDF</Button>
        </div>
      )}
    >
      {!isLecturer && (
        <div className="tabs">
          <Button variant={tab === "assignments" ? "primary" : "outline"} onClick={() => setTab("assignments")}>Danh sách phân công</Button>
          <Button variant={tab === "workloads" ? "primary" : "outline"} onClick={() => setTab("workloads")}>Khối lượng giảng dạy</Button>
        </div>
      )}
      <div className="filter-row">
        <Select label="Học kỳ" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
          {semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </Select>
      </div>

      {/* CHÈN VÀO ĐÂY: 4 Thẻ (Cards) thống kê tổng quan ở trên cùng cho tab Danh sách phân công */}
      {!isLecturer && tab === "assignments" && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", margin: "16px 0 24px 0" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Tổng số lớp</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#0f172a" }}>{summary.total}</div>
          </div>
          <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "10px", border: "1px solid #a7f3d0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#047857", marginBottom: "4px" }}>Đã duyệt (APPROVED)</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#059669" }}>{summary.approved}</div>
          </div>
          <div style={{ background: "#fffbeb", padding: "16px", borderRadius: "10px", border: "1px solid #fde68a", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#b45309", marginBottom: "4px" }}>Chờ duyệt (PENDING)</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#d97706" }}>{summary.pending}</div>
          </div>
          <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "10px", border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#1d4ed8", marginBottom: "4px" }}>Chưa phân công (OPEN)</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#2563eb" }}>{summary.open}</div>
          </div>
        </div>
      )}

      {isLecturer && lecturerStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "8px 0 24px 0" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Số giờ dạy tối đa</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0f172a" }}>{lecturerStats.max_hours || 120} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>giờ chuẩn</span></div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Thực tế phân công</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0284c7" }}>{lecturerStats.total_hours || 0} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>giờ chuẩn</span></div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Trạng thái định mức</div>
            <div style={{ marginTop: "6px" }}>
              <Badge variant={lecturerStats.status === "OVERLOAD" ? "danger" : "success"}>
                {lecturerStats.status === "OVERLOAD" ? "Vượt định mức" : "Đạt yêu cầu"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {isLecturer && <h4 style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "1rem" }}>Danh sách các lớp tín chỉ phụ trách trong học kỳ</h4>}

      {error && <div className="alert danger">{error}</div>}
      <Table columns={columns} rows={rows} loading={loading} />
    </Card>
  );
}
