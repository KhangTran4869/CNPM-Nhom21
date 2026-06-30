import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Field";
import { Button } from "../ui/Button";
import { authService } from "../../services/authService";
import { lecturerService } from "../../services/lecturerService";

export function EditProfileModal({ user, onClose, onUserChange }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    degree: user?.degree || "",
    preferences: user?.preferences || "",
    taught_hours: user?.taught_hours || 0,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      degree: user?.degree || "",
      preferences: user?.preferences || "",
      taught_hours: user?.taught_hours || 0,
    });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const nextUser = await authService.updateProfile(form);
      if (onUserChange) {
        onUserChange(nextUser);
      }
      alert("Cập nhật thông tin thành công!");
      onClose();
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
    <Modal title="Chỉnh sửa thông tin cá nhân" onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        <Input
          label="Họ và tên"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <Input
          label="Email liên hệ"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <Input
          label="Số điện thoại"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <Input
          label="Học hàm / Học vị"
          value={form.degree}
          onChange={(event) => setForm({ ...form, degree: event.target.value })}
          placeholder="VD: Thạc sĩ, Tiến sĩ..."
        />
        {error && <div className="alert danger">{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
