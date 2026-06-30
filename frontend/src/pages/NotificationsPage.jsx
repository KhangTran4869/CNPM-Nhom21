import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Field";
import { Badge } from "../components/ui/Badge";

const defaultNotifications = [
  {
    id: 1,
    title: "Kế hoạch phân công giảng dạy Học kỳ 1 năm học 2026-2027",
    content: "Đề nghị Trưởng các bộ môn khẩn trương rà soát danh sách lớp tín chỉ và thực hiện phân công giảng viên trước ngày 15/08/2026. Mọi thắc mắc xin liên hệ phòng Đào tạo.",
    date: "28/06/2026",
    type: "QUAN TRỌNG",
    author: "Phòng Đào tạo (Admin)",
  },
  {
    id: 2,
    title: "Nhắc nhở Giảng viên khai báo lịch bận / rảnh",
    content: "Toàn bộ giảng viên vui lòng truy cập chức năng 'Khai báo lịch bận / lịch rảnh' để cập nhật thời gian có thể giảng dạy trong tuần, hỗ trợ Trưởng bộ môn sắp xếp thời khóa biểu chính xác.",
    date: "25/06/2026",
    type: "NHẮC NHỞ",
    author: "Ban Quản trị",
  },
  {
    id: 3,
    title: "Cập nhật định mức giờ chuẩn giảng dạy mới",
    content: "Hệ thống đã cập nhật định mức giờ chuẩn theo quy định mới của Học viện. Giảng viên có thể xem chi tiết tại mục 'Khối lượng giảng dạy'.",
    date: "20/06/2026",
    type: "THÔNG TIN",
    author: "Phòng Tổ chức Cán bộ",
  },
];

export function NotificationsPage({ user }) {
  const isAdmin = user?.role === "ADMIN";
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "THÔNG TIN" });

  useEffect(() => {
    const saved = localStorage.getItem("uis_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
    }
  }, []);

  const saveToStorage = (items) => {
    setNotifications(items);
    localStorage.setItem("uis_notifications", JSON.stringify(items));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const newItem = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      type: form.type,
      date: new Date().toLocaleDateString("vi-VN"),
      author: user?.name || user?.username || "Admin",
    };
    saveToStorage([newItem, ...notifications]);
    setForm({ title: "", content: "", type: "THÔNG TIN" });
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    const filtered = notifications.filter((item) => item.id !== id);
    saveToStorage(filtered);
  };

  const resetDefault = () => {
    if (!window.confirm("Khôi phục lại các thông báo mẫu mặc định?")) return;
    saveToStorage(defaultNotifications);
  };

  const getBadgeVariant = (type) => {
    if (type === "QUAN TRỌNG") return "danger";
    if (type === "NHẮC NHỞ") return "warning";
    return "primary";
  };

  return (
    <div className="page-stack">
      <Card
        title="Thông báo từ ban quản trị"
        actions={
          <div className="row-actions">
            {isAdmin && <Button onClick={() => setModalOpen(true)}>+ Thêm thông báo</Button>}
          </div>
        }
      >
        {notifications.length === 0 ? (
          <div className="empty-state">Hiện chưa có thông báo nào từ ban quản trị.</div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color, #e5e7eb)",
                  backgroundColor: "var(--card-bg, #ffffff)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "12px" }}>
                  <div>
                    <span style={{ marginRight: "8px" }}>
                      <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                    </span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{item.title}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>🕒 {item.date}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontWeight: "bold", padding: "4px" }}
                        title="Xóa thông báo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: "8px 0", color: "var(--text-secondary)", lineHeight: "1.5", fontSize: "14px" }}>
                  {item.content}
                </p>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary, #9ca3af)", fontStyle: "italic", marginTop: "8px" }}>
                  Đăng bởi: {item.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <Modal title="Thêm thông báo mới" onClose={() => setModalOpen(false)}>
          <form className="form-grid" onSubmit={handleCreate}>
            <Input
              label="Tiêu đề thông báo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Thông báo nghỉ lễ..."
              required
            />
            <div className="form-group">
              <label className="form-label">Phân loại</label>
              <select
                className="form-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="THÔNG TIN">THÔNG TIN</option>
                <option value="QUAN TRỌNG">QUAN TRỌNG</option>
                <option value="NHẮC NHỞ">NHẮC NHỞ</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung thông báo</label>
              <textarea
                className="form-input"
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Nhập nội dung chi tiết..."
                required
              />
            </div>
            <Button className="form-submit" type="submit">Đăng thông báo</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
