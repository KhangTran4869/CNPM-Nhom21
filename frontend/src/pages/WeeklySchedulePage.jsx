import { Fragment, useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Field";
import { api } from "../services/api";

const days = [
  { key: 2, label: "Thứ 2" },
  { key: 3, label: "Thứ 3" },
  { key: 4, label: "Thứ 4" },
  { key: 5, label: "Thứ 5" },
  { key: 6, label: "Thứ 6" },
  { key: 7, label: "Thứ 7" },
  { key: 8, label: "Chủ Nhật" },
];

export function WeeklySchedulePage({ user }) {
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/semesters").then(setSemesters).catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/me/teaching-schedule", { semester_id: semesterId })
      .then(async (data) => {
        const enriched = await Promise.all(
          data.map(async (assignment) => {
            const classId = assignment.class_id?._id || assignment.class_id;
            if (!classId) return assignment;
            const schedules = await api.get(`/classes/${classId}/schedules`).catch(() => []);
            return {
              ...assignment,
              class_id: { ...(assignment.class_id || {}), schedules },
            };
          }),
        );
        setItems(enriched);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const cells = useMemo(() => {
    const map = {};
    items.forEach((assignment) => {
      const cls = assignment.class_id || {};
      (cls.schedules || []).forEach((schedule) => {
        map[`${schedule.day_of_week}-${schedule.start_period}`] = {
          assignment,
          schedule,
        };
      });
    });
    return map;
  }, [items]);

  return (
    <Card
      title="THỜI KHÓA BIỂU DẠNG TUẦN"
      actions={<Button variant="outline" onClick={() => window.print()}>In</Button>}
    >
      <div className="filter-row">
        <Select label="Học kỳ" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
          <option value="">Tất cả học kỳ</option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester._id}>{semester.name}</option>
          ))}
        </Select>
        <Select label="Loại thời khóa biểu">
          <option>Thời khóa biểu cá nhân</option>
          <option>Thời khóa biểu bộ môn</option>
        </Select>
        <Select label="Tuần">
          <option>Tuần hiện tại</option>
          <option>Tuần 44 [08/06/2026 - 14/06/2026]</option>
        </Select>
        <label className="check-field">
          <input type="checkbox" /> Thời khóa biểu tối
        </label>
      </div>
      {loading && <div className="alert info">Đang tải thời khóa biểu...</div>}
      <div className="schedule-grid">
        <div className="schedule-head">Tiết học</div>
        {days.map((day) => <div className="schedule-head" key={day.key}>{day.label}</div>)}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((period) => (
          <Fragment key={period}>
            <div className="period-cell" key={`p-${period}`}>Tiết {period}</div>
            {days.map((day) => {
              const cell = cells[`${day.key}-${period}`];
              const cls = cell?.assignment?.class_id || {};
              const course = cls.course_id || {};
              return (
                <div className={`schedule-cell ${cell ? "has-class" : ""}`} key={`${day.key}-${period}`}>
                  {cell && (
                    <>
                      <strong>{cls.code}</strong>
                      <span>{course.name || "Môn học"}</span>
                      <small>{cell.schedule.room_id?.name || "Phòng"}</small>
                      {user?.role !== "LECTURER" && <small>{cell.assignment.lecturer_id?.name}</small>}
                      <em>{cell.assignment.status}</em>
                    </>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}
