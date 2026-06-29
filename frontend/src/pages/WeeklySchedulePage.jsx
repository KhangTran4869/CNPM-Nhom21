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

const sessionsPerCredit = 4;

const groupOfClass = (classCode) => {
  const match = String(classCode || "").match(/(\d+)$/);
  return match ? match[1] : classCode || "N/A";
};

const courseTitle = (course) =>
  `${course?.name || "Môn học"}${course?.code ? ` (${course.code})` : ""}`;

const sessionTypeOf = (schedule) => String(schedule?.session_type || "THEORY").toUpperCase();

const sessionTypeLabel = (schedule) =>
  sessionTypeOf(schedule) === "PRACTICE" ? "Thực hành" : "Lý thuyết";

const sessionTypeClass = (schedule) =>
  sessionTypeOf(schedule) === "PRACTICE" ? "practice" : "theory";

const startOfDay = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date, daysToAdd) => {
  const next = new Date(date);
  next.setDate(next.getDate() + daysToAdd);
  return next;
};

const formatShortDate = (date) =>
  date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getWeekRange = (semesterStart, semesterEnd, index) => {
  const start = addDays(semesterStart, index * 7);
  const end = new Date(Math.min(addDays(start, 6).getTime(), semesterEnd.getTime()));
  return { start, end };
};

const buildSemesterWeeks = (semester) => {
  if (!semester?.start_date || !semester?.end_date) return [];
  const semesterStart = startOfDay(semester.start_date);
  const semesterEnd = startOfDay(semester.end_date);
  if (semesterEnd < semesterStart) return [];

  const totalDays = Math.floor((semesterEnd - semesterStart) / 86400000) + 1;
  return Array.from({ length: Math.ceil(totalDays / 7) }, (_, index) => ({
    value: String(index + 1),
    number: index + 1,
    ...getWeekRange(semesterStart, semesterEnd, index),
  }));
};

const findCurrentWeek = (weeks) => {
  const today = startOfDay();
  return weeks.find((week) => week.start <= today && today <= week.end);
};

const getClassSemesterId = (cls) => String(cls?.semester_id?._id || cls?.semester_id || "");

const getWeeklySchedules = (cls) =>
  [...(cls?.schedules || [])]
    .filter((schedule) => schedule.day_of_week && schedule.start_period && schedule.end_period)
    .sort((left, right) => {
      const dayDiff = Number(left.day_of_week) - Number(right.day_of_week);
      return dayDiff || Number(left.start_period) - Number(right.start_period);
    });

const shouldShowScheduleInWeek = (cls, schedule, weekNumber) => {
  const selectedWeek = Number(weekNumber || 1);
  const credits = Number(cls?.course_id?.credits || 0);
  const totalSessions = credits > 0 ? credits * sessionsPerCredit : Infinity;
  const weeklySchedules = getWeeklySchedules(cls);
  const scheduleIndex = weeklySchedules.findIndex((item) => String(item._id) === String(schedule._id));

  if (scheduleIndex < 0) return true;
  return (selectedWeek - 1) * weeklySchedules.length + scheduleIndex + 1 <= totalSessions;
};

export function WeeklySchedulePage({ user }) {
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
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

  const weekSemester = useMemo(() => {
    if (!semesterId) return null;
    return semesters.find((semester) => semester._id === semesterId);
  }, [semesterId, semesters]);

  const weeks = useMemo(() => buildSemesterWeeks(weekSemester), [weekSemester]);

  useEffect(() => {
    const currentWeek = findCurrentWeek(weeks);
    const nextWeekNumber = currentWeek?.value || weeks[0]?.value || "";
    setWeekNumber((current) => (weeks.some((week) => week.value === current) ? current : nextWeekNumber));
  }, [weeks]);

  const cells = useMemo(() => {
    const map = {};
    items.forEach((assignment) => {
      const cls = assignment.class_id || {};
      if (semesterId && weekSemester && getClassSemesterId(cls) !== String(weekSemester._id)) return;

      getWeeklySchedules(cls).forEach((schedule) => {
        if (semesterId && !shouldShowScheduleInWeek(cls, schedule, weekNumber)) return;

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
  }, [items, semesterId, weekNumber, weekSemester]);

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
        {user?.role !== "LECTURER" && (
          <Select label="Loại thời khóa biểu">
            <option>Thời khóa biểu cá nhân</option>
            <option>Thời khóa biểu toàn khoa</option>
          </Select>
        )}
        <Select label="Tuần" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} disabled={!weeks.length}>
          {!weeks.length && <option>{semesterId ? "Chưa có ngày học kỳ" : "Chọn học kỳ để xem tuần"}</option>}
          {weeks.map((week) => {
            const isCurrent = findCurrentWeek([week]);
            return (
              <option key={week.value} value={week.value}>
                {`Tuần ${week.number}${isCurrent ? " (hiện tại)" : ""} [${formatShortDate(week.start)} - ${formatShortDate(week.end)}]`}
              </option>
            );
          })}
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
                      className={`schedule-cell ${cell ? `has-class ${sessionTypeClass(cell.schedule)}` : ""}`}
                      key={`${day.key}-${period}`}
                      rowSpan={cell?.rowSpan || 1}
                    >
                      {cell && (
                        <div className="schedule-class-block">
                          <strong>{courseTitle(course)}</strong>
                          <span>Lớp: <strong>{cls.code || "N/A"}</strong></span>
                          <span>Loại: {sessionTypeLabel(cell.schedule)}</span>
                          <span>Nhóm: {cell.schedule.group_code || groupOfClass(cls.code)}</span>
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
