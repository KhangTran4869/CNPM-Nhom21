import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
      setSemesterId("all");
    }).catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    if (isLecturer && tab !== "workloads") {
      setTab("workloads");
    }
  }, [isLecturer, tab]);

  useEffect(() => {
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
            lecturerService.getLecturerWorkload(lid, { semester_id: semesterId }).catch(() => ({ total_hours: 0, max_hours: 180, status: "NORMAL" })),
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
          setRows(data || []);
          setSummary(sumData);
        } else {
          const data = await reportService.getLecturerWorkloads({ semester_id: semesterId });
          const filteredData = (data || []).filter(item => {
            const codeStr = (item.code || "").toUpperCase();
            const nameStr = (item.name || "").toUpperCase();
            if (codeStr.includes("TRUONGKHOA") || codeStr.includes("ADMIN") || nameStr.includes("TRƯỞNG KHOA") || nameStr === "ADMIN") return false;
            if (user?.role === "HEAD" && user?.faculty && item.faculty && item.faculty !== user.faculty) return false;
            return true;
          });
          setRows(filteredData);
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

  const exportReport = () => {
    setError("");
    try {
      if (!Array.isArray(rows) || rows.length === 0) {
        alert("Không có dữ liệu để xuất Excel");
        return;
      }
      let headers = [];
      let data = [];
      let fileName = "";

      const semObj = semesters.find(s => String(s._id) === String(semesterId));
      const semTag = semObj ? `_${semObj.name.replace(/\s+/g, "_")}` : "";
      const facTag = user?.role === "HEAD" && user?.faculty ? `_${user.faculty.replace(/\s+/g, "_")}` : "";

      if (isLecturer) {
        headers = ["Mã lớp tín chỉ", "Tên môn học", "Số tín chỉ", "Khối lượng giờ", "Trạng thái"];
        data = rows.map(row => [
          row.class_id?.code || "N/A",
          row.class_id?.course_id?.name || "N/A",
          row.class_id?.course_id?.credits || 3,
          row.class_id?.course_id?.total_hours || (row.class_id?.course_id?.credits || 3) * 15,
          row.status === "APPROVED" ? "Đã duyệt" : row.status === "PROPOSED" ? "Đề xuất" : row.status
        ]);
        fileName = "Khoi_luong_giang_day_cua_toi.xlsx";
      } else if (tab === "assignments") {
        headers = ["Mã lớp", "Môn học", "Mã GV", "Tên GV", "Học kỳ", "Trạng thái"];
        data = rows.map(row => [
          row.class_id?.code || "N/A",
          row.class_id?.course_id?.name || "N/A",
          row.lecturer_id?.code || "N/A",
          row.lecturer_id?.name || "N/A",
          row.class_id?.semester_id?.name || "N/A",
          row.status || "N/A"
        ]);
        fileName = `Danh_sach_phan_cong${facTag}${semTag}.xlsx`;
      } else {
        headers = ["Mã GV", "Họ tên", "Bộ môn", "Học kỳ", "Khối lượng (giờ)", "Số giờ tối đa", "Trạng thái"];
        data = rows.map(row => [
          row.code || "N/A",
          row.name || "N/A",
          row.department || "N/A",
          row.semester_name || semObj?.name || "Tất cả học kỳ",
          row.total_hours || 0,
          row.max_hours || 180,
          row.status || "N/A"
        ]);
        fileName = `Bao_cao_khoi_luong${facTag}${semTag}.xlsx`;
      }

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      worksheet["!cols"] = headers.map((h, idx) => ({
        wch: Math.max(h.length, ...data.map(r => String(r[idx] || "").length)) + 5
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Không thể xuất Excel", err);
      setError("Có lỗi xảy ra khi tạo file Excel");
    }
  };

  const workloadsSummary = tab === "workloads" && Array.isArray(rows) ? {
    total: rows.length,
    thieu: rows.filter(r => r.status === "Thiếu giờ").length,
    du: rows.filter(r => r.status === "Đủ giờ" || r.status === "Đủ tải").length,
    vuot: rows.filter(r => r.status === "Vượt tải").length
  } : null;

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
        { key: "semester", title: "Học kỳ", render: (row) => <Badge variant="outline">{row.semester_name || semesters.find(s => String(s._id) === String(semesterId))?.name || "Tất cả học kỳ"}</Badge> },
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
      actions={!isLecturer && (isAdmin || user?.role === "HEAD") && (
        <div className="row-actions">
          <Button variant="primary" onClick={exportReport} style={{ background: "#10b981", borderColor: "#059669", color: "white", fontWeight: 600 }}>Xuất Excel (.xlsx)</Button>
        </div>
      )}
    >
      {!isLecturer && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
          <Button variant={tab === "assignments" ? "primary" : "outline"} onClick={() => setTab("assignments")} style={{ fontWeight: tab === "assignments" ? "600" : "400" }}>Danh sách phân công</Button>
          <Button variant={tab === "workloads" ? "primary" : "outline"} onClick={() => setTab("workloads")} style={{ fontWeight: tab === "workloads" ? "600" : "400" }}>Khối lượng giảng dạy</Button>
        </div>
      )}
      <div className="filter-row">
        <Select label="Học kỳ" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
          <option value="all">Tất cả học kỳ</option>
          {semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </Select>
      </div>

      {/* 4 Thẻ (Cards) thống kê tổng quan ở trên cùng cho tab Danh sách phân công */}
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

      {/* 4 Thẻ (Cards) thống kê tổng quan ở trên cùng cho tab Khối lượng giảng dạy */}
      {!isLecturer && tab === "workloads" && workloadsSummary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", margin: "16px 0 24px 0" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Tổng số giảng viên</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#0f172a" }}>{workloadsSummary.total}</div>
          </div>
          <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "10px", border: "1px solid #fecaca", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#b91c1c", marginBottom: "4px" }}>Thiếu giờ chuẩn</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#dc2626" }}>{workloadsSummary.thieu}</div>
          </div>
          <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "10px", border: "1px solid #a7f3d0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#047857", marginBottom: "4px" }}>Đủ giờ tối thiểu</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#059669" }}>{workloadsSummary.du}</div>
          </div>
          <div style={{ background: "#fffbeb", padding: "16px", borderRadius: "10px", border: "1px solid #fde68a", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#b45309", marginBottom: "4px" }}>Vượt định mức</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#d97706" }}>{workloadsSummary.vuot}</div>
          </div>
        </div>
      )}

      {isLecturer && lecturerStats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "8px 0 24px 0" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "4px" }}>Số giờ dạy tối đa</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0f172a" }}>{lecturerStats.max_hours || 180} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>giờ chuẩn</span></div>
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
