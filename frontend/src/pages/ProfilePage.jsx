import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Field";
import { authService } from "../services/authService";
import { lecturerService } from "../services/lecturerService";

const buildForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  degree: user?.degree || "",
});

export function ProfilePage({ user, onUserChange }) {
  const [form, setForm] = useState(buildForm(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(buildForm(user));
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user?.lecturer_id) {
      setError("Tài khoản này chưa được liên kết với hồ sơ giảng viên");
      return;
    }

    setSaving(true);
    try {
      await lecturerService.updateLecturer(user.lecturer_id, form);
      const nextUser = await authService.getMe();
      onUserChange(nextUser);
      setMessage("Cập nhật thông tin thành công");
    } catch (err) {
      setError(
        err.payload?.errors?.map((item) => item.message || item.rule || item).join(", ") ||
          err.message ||
          "Không thể cập nhật thông tin",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <Card title="Cập nhật thông tin cá nhân">
        <div className="profile-grid profile-summary">
          <div className="profile-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || user?.username?.slice(0, 1)?.toUpperCase()}</div>
          <Info label="Mã giảng viên" value={user?.code} />
          <Info label="Tài khoản" value={user?.username} />
          <Info label="Bộ môn" value={user?.department} />
          <Info label="Vai trò" value={<Badge>{user?.role}</Badge>} />
          <Info label="Trạng thái tài khoản" value={<Badge>{user?.status}</Badge>} />
          <Info label="Định mức giờ" value={user?.max_hours} />
        </div>
      </Card>

      <Card title="Thông tin liên hệ">
        <form className="form-grid" onSubmit={submit}>
          <Input label="Họ tên" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <Input label="Học vị" value={form.degree} onChange={(event) => setForm({ ...form, degree: event.target.value })} />
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-cell">
      <span>{label}</span>
      <strong>{value || "Chưa cập nhật"}</strong>
    </div>
  );
}
