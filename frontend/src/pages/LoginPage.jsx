import { useState } from "react";
import { authService } from "../services/authService";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "admin", password: "123456" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(form);
      const me = await authService.getMe();
      onLogin(me || data.user);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">UIS</div>
        <h1>Hệ thống phân công giảng viên</h1>
        <p>Đăng nhập để quản lý lớp tín chỉ, lịch dạy và phân công giảng viên.</p>
        {error && <div className="alert danger">{error}</div>}
        <Input
          label="Tên đăng nhập"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button className="full-btn" disabled={loading} type="submit">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
