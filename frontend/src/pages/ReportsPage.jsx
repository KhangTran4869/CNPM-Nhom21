import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Table } from "../components/ui/Table";
import { catalogService } from "../services/catalogService";
import { reportService } from "../services/reportService";

export function ReportsPage() {
  const [tab, setTab] = useState("assignments");
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    catalogService.getSemesters().then((data) => {
      setSemesters(data);
      setSemesterId(data[0]?._id || "");
    }).catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    if (!semesterId) return;
    const loader = tab === "assignments"
      ? reportService.getAssignmentReport({ semester_id: semesterId })
      : reportService.getLecturerWorkloads({ semester_id: semesterId });
    loader.then(setRows).catch(() => setRows([]));
  }, [tab, semesterId]);

  const exportReport = async (format) => {
    const data = await reportService.exportAssignmentReport({ semester_id: semesterId, format });
    alert(data.download_url);
  };

  const columns = tab === "assignments"
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
      title="Báo cáo thống kê"
      actions={tab === "assignments" && (
        <div className="row-actions">
          <Button variant="outline" onClick={() => exportReport("excel")}>Xuất Excel</Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>Xuất PDF</Button>
        </div>
      )}
    >
      <div className="tabs">
        <Button variant={tab === "assignments" ? "primary" : "outline"} onClick={() => setTab("assignments")}>Danh sách phân công</Button>
        <Button variant={tab === "workloads" ? "primary" : "outline"} onClick={() => setTab("workloads")}>Tải giảng dạy</Button>
      </div>
      <div className="filter-row">
        <Select label="Học kỳ" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
          {semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </Select>
      </div>
      <Table columns={columns} rows={rows} />
    </Card>
  );
}
