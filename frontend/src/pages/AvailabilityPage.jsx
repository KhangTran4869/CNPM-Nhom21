import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { Table } from "../components/ui/Table";
import { lecturerService } from "../services/lecturerService";
import { authService } from "../services/authService";

const DAYS_OF_WEEK = [
  { value: 2, label: "Thứ 2" },
  { value: 3, label: "Thứ 3" },
  { value: 4, label: "Thứ 4" },
  { value: 5, label: "Thứ 5" },
  { value: 6, label: "Thứ 6" },
  { value: 7, label: "Thứ 7" },
  { value: 8, label: "Chủ nhật" },
];

const PERIODS = [
  { value: 1, label: "Tiết 1 (07:00 - 07:50)" },
  { value: 2, label: "Tiết 2 (07:55 - 08:45)" },
  { value: 3, label: "Tiết 3 (08:50 - 09:40)" },
  { value: 4, label: "Tiết 4 (09:45 - 10:35)" },
  { value: 5, label: "Tiết 5 (10:40 - 11:30)" },
  { value: 6, label: "Tiết 6 (11:35 - 12:25)" },
  { value: 7, label: "Tiết 7 (12:30 - 13:20)" },
  { value: 8, label: "Tiết 8 (13:25 - 14:15)" },
  { value: 9, label: "Tiết 9 (14:20 - 15:10)" },
  { value: 10, label: "Tiết 10 (15:15 - 16:05)" },
  { value: 11, label: "Tiết 11 (16:10 - 17:00)" },
  { value: 12, label: "Tiết 12 (17:05 - 17:55)" },
];

export function AvailabilityPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [lecturerId, setLecturerId] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ day_of_week: 2, start_period: 1, end_period: 3, status: "BUSY" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(user?.preferences || "");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefMsg, setPrefMsg] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (user?.preferences !== undefined) {
      setPreferences(user.preferences || "");
    }
  }, [user]);

  const savePreferences = async (e) => {
    e.preventDefault();
    setPrefSaving(true);
    setPrefMsg("");
    try {
      await authService.updateProfile({ preferences });
      setPrefMsg("Đã cập nhật nguyện vọng giảng dạy thành công!");
    } catch {
      setPrefMsg("Lỗi khi lưu nguyện vọng");
    } finally {
      setPrefSaving(false);
    }
  };

  useEffect(() => {
    lecturerService.getLecturers().then((data) => {
      setLecturers(data || []);
      if (!isAdmin && user?.lecturer_id) {
        setLecturerId(user.lecturer_id);
      } else if (!isAdmin && user?.username) {
        const found = (data || []).find(l => l.code?.toLowerCase() === user.username?.toLowerCase() || l.name === user.name);
        setLecturerId(found?._id || data[0]?._id || "");
      } else {
        setLecturerId(data[0]?._id || "");
      }
    }).catch(() => {
      setLecturers([]);
      if (!isAdmin && user?.lecturer_id) {
        setLecturerId(user.lecturer_id);
      }
    });
  }, [user, isAdmin]);

  const loadAvailability = () => {
    if (!lecturerId) return;
    setLoading(true);
    lecturerService.getAvailability(lecturerId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAvailability();
  }, [lecturerId]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (Number(form.end_period) < Number(form.start_period)) {
      setError("Tiết kết thúc phải lớn hơn hoặc bằng Tiết bắt đầu!");
      return;
    }

    try {
      await lecturerService.createAvailability(lecturerId, {
        day_of_week: Number(form.day_of_week),
        start_period: Number(form.start_period),
        end_period: Number(form.end_period),
        status: form.status,
      });
      setMessage("Đã đăng ký khung giờ thành công!");
      loadAvailability();
    } catch (err) {
      let msg = err.message || err?.response?.data?.message || "Lỗi khi đăng ký lịch rảnh/bận";
      if (err.payload?.errors?.includes("AVAILABILITY_OVERLAP")) {
        msg = "Khung giờ này bị trùng lặp với lịch đã khai báo trước đó!";
      }
      setError(msg);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này?")) return;
    setError("");
    setMessage("");
    try {
      await lecturerService.deleteAvailability(id);
      setMessage("Đã xóa khung giờ!");
      loadAvailability();
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi xóa khung giờ");
    }
  };

  const columns = [
    {
      key: "day",
      title: "Thứ trong tuần",
      render: (row) => <strong>{row.day_of_week === 8 ? "Chủ nhật" : `Thứ ${row.day_of_week}`}</strong>,
    },
    {
      key: "time",
      title: "Khung thời gian (Tiết)",
      render: (row) => `Tiết ${row.start_period} đến Tiết ${row.end_period}`,
    },
    {
      key: "session",
      title: "Buổi học",
      render: (row) => {
        if (row.end_period <= 6) return <span style={{ color: "#0284c7" }}>☀️ Buổi sáng</span>;
        if (row.start_period >= 7) return <span style={{ color: "#d97706" }}>🌅 Buổi chiều</span>;
        return <span>Cả ngày</span>;
      },
    },
    {
      key: "status",
      title: "Phân loại lịch",
      render: (row) => (
        <Badge type={row.status === "BUSY" ? "danger" : "success"}>
          {row.status === "BUSY" ? "🔴 Bận (Không xếp lịch)" : "🟢 Rảnh (Mong muốn dạy)"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (row) => (
        <Button variant="danger" size="sm" onClick={() => remove(row._id)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="page-stack" style={{ display: "grid", gap: "20px" }}>
      {!isAdmin && (
        <Card title="📝 Khai báo nguyện vọng giảng dạy trong học kỳ">
          {prefMsg && (
            <div className={`alert ${prefMsg.includes("Lỗi") ? "danger" : "success"}`} style={{ marginBottom: "12px", background: prefMsg.includes("Lỗi") ? "#fee2e2" : "#d1fae5", color: prefMsg.includes("Lỗi") ? "#991b1b" : "#065f46", padding: "10px", borderRadius: "6px" }}>
              {prefMsg}
            </div>
          )}
          <form onSubmit={savePreferences} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: "600", color: "#334155" }}>
              <span>Nguyện vọng giảng dạy môn học / khung giờ / đối tượng sinh viên:</span>
              <textarea
                className="uis-input"
                rows={3}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="VD: Mong muốn được phân công dạy môn Cơ sở dữ liệu buổi sáng, không bố trí lớp vào chiều thứ 6 do họp bộ môn..."
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </label>
            <div>
              <Button type="submit" variant="primary" disabled={prefSaving}>
                {prefSaving ? "Đang lưu..." : "💾 Lưu nguyện vọng"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="🗓️ Khai báo lịch bận giảng dạy">
        <div style={{ padding: "12px 16px", background: "#f8fafc", borderLeft: "4px solid var(--primary-color)", borderRadius: "6px", marginBottom: "16px", fontSize: "0.95rem", lineHeight: "1.5" }}>
          <p style={{ margin: 0 }}>
            💡 <strong>Quy định xếp lịch:</strong> Giảng viên chỉ cần khai báo các khung giờ <strong>Bận</strong> (công tác, học tập, việc riêng). Nếu không khai báo bận, hệ thống sẽ tự động coi là <strong>Rảnh</strong> để thuận tiện cho việc xếp lịch tự động!
          </p>
        </div>

        {message && <div className="alert success" style={{ marginBottom: "16px", background: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "6px" }}>{message}</div>}
        {error && <div className="alert danger" style={{ marginBottom: "16px" }}>{error}</div>}

        {isAdmin && (
          <div style={{ marginBottom: "16px", maxWidth: "400px" }}>
            <Select label="Chọn Giảng viên cần khai báo hộ" value={lecturerId} onChange={(e) => setLecturerId(e.target.value)}>
              {lecturers.map((item) => <option key={item._id} value={item._id}>{item.code} - {item.name}</option>)}
            </Select>
          </div>
        )}

        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "flex-end", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <Select
            label="Thứ trong tuần"
            value={form.day_of_week}
            onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </Select>

          <Select
            label="Tiết bắt đầu"
            value={form.start_period}
            onChange={(e) => setForm({ ...form, start_period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>

          <Select
            label="Tiết kết thúc"
            value={form.end_period}
            onChange={(e) => setForm({ ...form, end_period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>

          <Select
            label="Trạng thái lịch"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            disabled
          >
            <option value="BUSY">🔴 Bận (Không xếp lịch)</option>
          </Select>

          <Button type="submit" variant="primary" style={{ height: "42px", fontWeight: "600" }}>
            ➕ Đăng ký lịch
          </Button>
        </form>
      </Card>

      <Card title="📋 Danh sách các khung giờ đã khai báo">
        <Table columns={columns} rows={items} loading={loading} />
      </Card>
    </div>
  );
}
