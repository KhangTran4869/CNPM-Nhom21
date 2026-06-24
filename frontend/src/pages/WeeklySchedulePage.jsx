import { useEffect, useMemo, useState } from "react";
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

const groupOfClass = (classCode) => {
  const match = String(classCode || "").match(/(\d+)$/);
  return match ? match[1] : classCode || "N/A";
};

const courseTitle = (course) =>
  `${course?.name || "Môn học"}${course?.code ? ` (${course.code})` : ""}`;

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
        const start = Number(schedule.start_period);
        const end = Number(schedule.end_period);
        map[`${schedule.day_of_week}-${start}`] = {
          assignment,
          schedule,
          rowSpan: Math.max(end - start + 1, 1),
        };
      });
    });
    return map;
  }, [items]);

  const isCoveredByPreviousPeriod = (dayKey, period) =>
    Object.values(cells).some(({ schedule }) => {
      if (Number(schedule.day_of_week) !== Number(dayKey)) return false;
      return Number(schedule.start_period) < period && Number(schedule.end_period) >= period;
    });

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
      <div className="schedule-table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Tiết học</th>
              {days.map((day) => <th key={day.key}>{day.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((period) => (
              <tr key={period}>
                <th className="period-cell">Tiết {period}</th>
                {days.map((day) => {
                  if (isCoveredByPreviousPeriod(day.key, period)) return null;
                  const cell = cells[`${day.key}-${period}`];
                  const cls = cell?.assignment?.class_id || {};
                  const course = cls.course_id || {};
                  return (
                    <td
                      className={`schedule-cell ${cell ? "has-class" : ""}`}
                      key={`${day.key}-${period}`}
                      rowSpan={cell?.rowSpan || 1}
                    >
                      {cell && (
                        <div className="schedule-class-block">
                          <strong>{courseTitle(course)}</strong>
                          <span>Nhóm: {groupOfClass(cls.code)}</span>
                          <span>Phòng: {cell.schedule.room_id?.name || "N/A"}</span>
                          {user?.role !== "LECTURER" && <span>GV: {cell.assignment.lecturer_id?.name || "N/A"}</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
