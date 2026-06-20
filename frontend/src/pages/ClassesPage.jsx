import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { catalogService } from "../services/catalogService";
import { classService } from "../services/classService";

export function ClassesPage({ user }) {
  const [classes, setClasses] = useState([]);
  const [catalog, setCatalog] = useState({ courses: [], semesters: [], rooms: [] });
  const [filters, setFilters] = useState({ keyword: "", semester_id: "", course_id: "", status: "" });
  const [form, setForm] = useState({ code: "", course_id: "", semester_id: "", max_students: 80 });
  const [scheduleForm, setScheduleForm] = useState({ class_id: "", day_of_week: 2, start_period: 1, end_period: 3, room_id: "" });
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

  const createClass = async (event) => {
    event.preventDefault();
    await classService.createClass(form);
    setModal("");
    load();
  };

  const createSchedule = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await classService.createClassSchedule(scheduleForm.class_id, scheduleForm);
      if (selectedClass?._id === scheduleForm.class_id) {
        const data = await classService.getClassSchedules(scheduleForm.class_id);
        setSchedules(data);
      }
      setModal("");
    } catch (err) {
      setError(err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") || err.message);
    }
  };

  const openSchedules = async (classItem) => {
    setSelectedClass(classItem);
    setSchedules([]);
    setModal(`Lịch học lớp ${classItem.code}`);
    const data = await classService.getClassSchedules(classItem._id).catch(() => []);
    setSchedules(data);
  };

  const columns = [
    { key: "code", title: "Mã lớp" },
    { key: "course", title: "Môn học", render: (row) => row.course_id?.name || "Chưa cập nhật" },
    { key: "semester", title: "Học kỳ", render: (row) => row.semester_id?.name || "Chưa cập nhật" },
    { key: "max_students", title: "Số SV tối đa" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
    { key: "schedule", title: "Lịch học", render: (row) => <Button variant="outline" onClick={() => openSchedules(row)}>Xem lịch</Button> },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => isAdmin && (
        <Button variant="outline" onClick={() => {
          setScheduleForm({ ...scheduleForm, class_id: row._id });
          setModal("Thêm lịch học");
        }}>Thêm lịch</Button>
      ),
    },
  ];

  return (
    <>
      <Card title="Danh sách lớp tín chỉ" actions={isAdmin && <Button onClick={() => setModal("Tạo lớp tín chỉ")}>Tạo lớp tín chỉ</Button>}>
        <div className="filter-row">
          <Input label="Tìm mã lớp" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
          <Select label="Học kỳ" value={filters.semester_id} onChange={(e) => setFilters({ ...filters, semester_id: e.target.value })}>
            <option value="">Tất cả</option>
            {catalog.semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
          <Select label="Môn học" value={filters.course_id} onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}>
            <option value="">Tất cả</option>
            {catalog.courses.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </Select>
        </div>
        <Table columns={columns} rows={classes} loading={loading} />
      </Card>
      <Modal title={modal} onClose={() => setModal("")}>
        {modal === "Tạo lớp tín chỉ" ? (
          <form className="form-grid" onSubmit={createClass}>
            <Input label="Mã lớp" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Select label="Môn học" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Chọn môn</option>
              {catalog.courses.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Select label="Học kỳ" value={form.semester_id} onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
              <option value="">Chọn học kỳ</option>
              {catalog.semesters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Input label="Số SV tối đa" type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })} />
            <Button className="form-submit" type="submit">Lưu</Button>
          </form>
        ) : modal === "Thêm lịch học" ? (
          <form className="form-grid" onSubmit={createSchedule}>
            {error && <div className="alert danger">{error}</div>}
            <Input label="Thứ" type="number" value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: Number(e.target.value) })} />
            <Input label="Tiết bắt đầu" type="number" value={scheduleForm.start_period} onChange={(e) => setScheduleForm({ ...scheduleForm, start_period: Number(e.target.value) })} />
            <Input label="Tiết kết thúc" type="number" value={scheduleForm.end_period} onChange={(e) => setScheduleForm({ ...scheduleForm, end_period: Number(e.target.value) })} />
            <Select label="Phòng" value={scheduleForm.room_id} onChange={(e) => setScheduleForm({ ...scheduleForm, room_id: e.target.value })}>
              <option value="">Chọn phòng</option>
              {catalog.rooms.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </Select>
            <Button className="form-submit" type="submit">Lưu lịch</Button>
          </form>
        ) : (
          <div className="page-stack">
            <Table
              columns={[
                { key: "day_of_week", title: "Thứ" },
                { key: "period", title: "Tiết", render: (row) => `${row.start_period} - ${row.end_period}` },
                { key: "room", title: "Phòng", render: (row) => row.room_id?.name || "N/A" },
              ]}
              rows={schedules}
            />
            {isAdmin && selectedClass && (
              <Button
                onClick={() => {
                  setScheduleForm({ ...scheduleForm, class_id: selectedClass._id });
                  setModal("Thêm lịch học");
                }}
              >
                Thêm lịch học
              </Button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
