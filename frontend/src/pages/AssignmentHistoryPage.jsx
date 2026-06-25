import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Field";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { formatDateTime } from "../utils/format";

const lecturerName = (lecturer) => lecturer?.name || lecturer?.code || "N/A";

export function AssignmentHistoryPage() {
  const { filteredRows, keyword, setKeyword, loading, error, load } = useResourceList("/assignment-history", {
    searchKeys: [
      "assignment_id._id",
      "old_lecturer_id.name",
      "old_lecturer_id.code",
      "new_lecturer_id.name",
      "new_lecturer_id.code",
    ],
  });

  const columns = [
    { key: "assignment", title: "Assignment", render: (row) => row.assignment_id?._id || row.assignment_id || "N/A" },
    { key: "old", title: "GV cũ", render: (row) => lecturerName(row.old_lecturer_id) },
    { key: "new", title: "GV mới", render: (row) => lecturerName(row.new_lecturer_id) },
    { key: "changed_at", title: "Thời gian", render: (row) => formatDateTime(row.changed_at) },
  ];

  return (
    <Card
      title="Lịch sử thay đổi phân công"
      actions={<Button variant="outline" onClick={() => load()}>Làm mới</Button>}
    >
      <div className="filter-row">
        <Input label="Tìm kiếm" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      </div>
      {error && <div className="alert danger">{error}</div>}
      <Table columns={columns} rows={filteredRows} loading={loading} />
    </Card>
  );
}
