import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { api } from "../services/api";
import { assignmentService } from "../services/assignmentService";
import { catalogService } from "../services/catalogService";
import { classService } from "../services/classService";

const sessionsPerCredit = 4;

const scheduleTypes = [
  { value: "personal", label: "Thời khóa biểu cá nhân" },
  { value: "all", label: "Thời khóa biểu toàn khoa" },
];

const groupOfClass = (classCode) => {
  const match = String(classCode || "").match(/(\d+)$/);
  return match ? match[1] : "N/A";
};

const formatScheduleTime = (schedule) => {
  if (!schedule) return "N/A";
  const day = schedule.day_of_week;
  let dayStr = "";
  if (day === 8 || String(day).toUpperCase() === "CN" || String(day).toLowerCase() === "chủ nhật") {
    dayStr = "CN";
  } else if (!isNaN(day)) {
    dayStr = `T${day}`;
  } else {
    dayStr = String(day).replace(/Thứ\s*/i, "T");
  }
  const start = Number(schedule.start_period || 1);
  const end = schedule.end_period !== undefined && schedule.end_period !== null ? Number(schedule.end_period) : start;
  return `${dayStr}, tiết ${start}-${end}`;
};

const dateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date, daysToAdd) => {
  const next = new Date(date);
  next.setDate(next.getDate() + daysToAdd);
  return next;
};

const formatShortDate = (date) =>
  date
    ? date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "N/A";

const firstDateForDay = (semesterStart, dayOfWeek) => {
  const target = Number(dayOfWeek) === 8 ? 0 : Number(dayOfWeek);
  const startDay = semesterStart.getDay();
  const diff = (target - startDay + 7) % 7;
  return addDays(semesterStart, diff);
};

const getWeeklySchedules = (cls) =>
  [...(cls?.schedules || [])]
    .filter((schedule) => schedule.day_of_week && schedule.start_period && schedule.end_period)
    .sort((left, right) => {
      const dayDiff = Number(left.day_of_week) - Number(right.day_of_week);
      return dayDiff || Number(left.start_period) - Number(right.start_period);
    });

const getScheduleDateRange = (semester, cls, schedule) => {
  const semesterStart = dateOnly(semester?.start_date);
  const semesterEnd = dateOnly(semester?.end_date);
  if (!semesterStart || !semesterEnd || semesterEnd < semesterStart) return "N/A";

  const weeklySchedules = getWeeklySchedules(cls);
  const credits = Number(cls?.course_id?.credits || 0);
  const totalSessions = credits > 0 ? credits * sessionsPerCredit : weeklySchedules.length;
  const sessionsForThisSchedule = Math.max(
    1,
    Math.ceil(totalSessions / Math.max(weeklySchedules.length, 1)),
  );

  const firstDate = firstDateForDay(semesterStart, schedule.day_of_week);
  const lastDate = new Date(
    Math.min(addDays(firstDate, (sessionsForThisSchedule - 1) * 7).getTime(), semesterEnd.getTime()),
  );

  if (firstDate > semesterEnd) return "N/A";
  return `${formatShortDate(firstDate)} - ${formatShortDate(lastDate)}`;
};

const flattenRows = (items, semesterId) =>
  items
    .filter((assignment) => {
      const cls = assignment.class_id || {};
      if (!semesterId) return true;
      return String(cls.semester_id?._id || cls.semester_id || "") === String(semesterId);
    })
    .map((assignment) => {
      const cls = assignment.class_id || {};
      const semester = cls.semester_id || {};
      const schedules = getWeeklySchedules(cls);
      return {
        assignment,
        cls,
        course: cls.course_id || {},
        lecturer: assignment.lecturer_id || {},
        schedules: schedules.length ? schedules : [null],
        semester,
      };
    });

export function SemesterSchedulePage({ user }) {
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [scheduleType, setScheduleType] = useState("personal");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogService
      .getSemesters()
      .then((data) => {
        setSemesters(data);
        setSemesterId((current) => current || data[0]?._id || "");
      })
      .catch(() => setSemesters([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          semester_id: semesterId,
          status: "APPROVED",
        };
        const data =
          scheduleType === "personal" && user?.role === "LECTURER"
            ? await api.get("/me/teaching-schedule", params)
            : await assignmentService.getAssignments(params);

        const enriched = await Promise.all(
          data.map(async (assignment) => {
            const classId = assignment.class_id?._id || assignment.class_id;
            if (!classId) return assignment;
            const schedules = await classService.getClassSchedules(classId).catch(() => []);
            return {
              ...assignment,
              class_id: { ...(assignment.class_id || {}), schedules },
            };
          }),
        );
        setItems(enriched);
      } catch (err) {
        setItems([]);
        setError(err.message || "Không thể tải thời khóa biểu học kỳ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [semesterId, scheduleType, user?.role]);

  const rows = useMemo(() => flattenRows(items, semesterId), [items, semesterId]);

  return (
    <Card title="THỜI KHÓA BIỂU DẠNG HỌC KỲ">
      <div className="semester-toolbar">
        <Select label="Học kỳ" value={semesterId} onChange={(event) => setSemesterId(event.target.value)}>
          <option value="">Tất cả học kỳ</option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester._id}>{semester.name}</option>
          ))}
        </Select>
        {user?.role !== "LECTURER" && (
          <Select label="Loại thời khóa biểu" value={scheduleType} onChange={(event) => setScheduleType(event.target.value)}>
            {scheduleTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        )}
      </div>

      {loading && <div className="alert">Đang tải thời khóa biểu học kỳ...</div>}
      {error && <div className="alert danger">{error}</div>}

      <div className="semester-table-wrap">
        <table className="semester-table">
          <thead>
            <tr>
              <th className="sem-col-code">Mã MH</th>
              <th className="sem-col-name">Tên môn học</th>
              <th className="sem-col-group">Nhóm tổ</th>
              <th className="sem-col-credits">Số tín chỉ</th>
              <th className="sem-col-class">Lớp</th>
              <th className="sem-col-schedule">Lịch học</th>
              <th className="sem-col-room">Phòng</th>
              <th className="sem-col-lecturer">Giảng viên</th>
              <th className="sem-col-time">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>Không có dữ liệu thời khóa biểu</td>
              </tr>
            )}
            {!loading &&
              rows.map(({ assignment, cls, course, lecturer, schedules, semester }) =>
                schedules.map((schedule, index) => (
                  <tr key={`${assignment._id}-${schedule?._id || index}`} className={index === 0 ? "sem-row-main" : "sem-row-sub"}>
                    {index === 0 && (
                      <>
                        <td rowSpan={schedules.length} className="sem-col-code">{course.code || "N/A"}</td>
                        <td rowSpan={schedules.length} className="sem-col-name">{course.name || "N/A"}</td>
                        <td rowSpan={schedules.length} className="sem-col-group">{groupOfClass(cls.code)}</td>
                        <td rowSpan={schedules.length} className="sem-col-credits">{course.credits || "N/A"}</td>
                        <td rowSpan={schedules.length} className="sem-col-class">{cls.code || "N/A"}</td>
                      </>
                    )}
                    <td className="sem-col-schedule">{formatScheduleTime(schedule)}</td>
                    <td className="sem-col-room">{schedule?.room_id?.name || "N/A"}</td>
                    <td className="sem-col-lecturer">{lecturer.name || "N/A"}</td>
                    <td className="sem-col-time">{schedule ? getScheduleDateRange(semester, cls, schedule) : "N/A"}</td>
                  </tr>
                )),
              )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
