import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./styles/uis-theme.css";
import { AppLayout } from "./components/layout/AppLayout";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Field";
import { Modal } from "./components/ui/Modal";
import { LoginPage } from "./pages/LoginPage";
import { renderPage } from "./routes/AppRouter";
import { api, tokenStore } from "./services/api";
import { authService } from "./services/authService";

function currentPath() {
  const path = window.location.pathname;
  return path === "/" ? "/home" : path;
}

/**
 * Component gốc của ứng dụng (Root Application Component)
 * Quản lý trạng thái đăng nhập (Authentication), điều hướng Router và Modal bắt buộc đổi mật khẩu
 */
function App() {
  const [path, setPath] = useState(currentPath());
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // States quản lý đổi mật khẩu bắt buộc lần đầu cho Giảng viên / Trưởng khoa
  const [passForm, setPassForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [passError, setPassError] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  useEffect(() => {
    const pop = () => setPath(currentPath());
    const expired = () => {
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("popstate", pop);
    window.addEventListener("auth:expired", expired);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("auth:expired", expired);
    };
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) {
      setBooting(false);
      if (currentPath() !== "/login") navigate("/login");
      return;
    }
    authService
      .getMe()
      .then((me) => {
        setUser(me);
        if (currentPath() === "/login") navigate("/home");
      })
      .catch(() => {
        tokenStore.clear();
        navigate("/login");
      })
      .finally(() => setBooting(false));
  }, []);

  // Điều phối Component theo đường dẫn và Role của người dùng
  const page = useMemo(() => {
    return renderPage({ path, user, navigate, setUser });
  }, [path, user]);

  const onLogin = (nextUser) => {
    setUser(nextUser);
    navigate("/home");
  };

  const onLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const submitForceChangePass = async (e) => {
    e.preventDefault();
    setPassError("");
    if (passForm.new_password !== passForm.confirm_password) {
      setPassError("Mật khẩu xác nhận không khớp");
      return;
    }
    setChangingPass(true);
    try {
      const updatedUser = await api.post("/auth/change-password", {
        old_password: passForm.old_password || undefined,
        new_password: passForm.new_password,
      });
      setUser(updatedUser);
      setPassForm({ old_password: "", new_password: "", confirm_password: "" });
      alert("Đổi mật khẩu thành công! Bạn có thể tiếp tục sử dụng hệ thống.");
    } catch (err) {
      setPassError(
        err.payload?.errors?.map((item) => item.message || item).join(", ") ||
          err.message ||
          "Không thể đổi mật khẩu",
      );
    } finally {
      setChangingPass(false);
    }
  };

  if (booting) return <div className="boot-screen">Đang khởi động giao diện...</div>;
  if (path === "/login" || !user) return <LoginPage onLogin={onLogin} />;

  return (
    <AppLayout
      user={user}
      path={path}
      collapsed={collapsed}
      onMenu={() => setCollapsed((value) => !value)}
      onLogout={onLogout}
      navigate={navigate}
    >
      {page}

      {/* Modal yêu cầu đổi mật khẩu lần đầu (chỉ hiển thị cho Trưởng khoa & Giảng viên) */}
      {user?.must_change_password && user?.role !== "ADMIN" && (
        <Modal title="Yêu cầu đổi mật khẩu lần đầu" onClose={() => {}}>
          <div style={{ marginBottom: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
            Tài khoản của bạn đang sử dụng mật khẩu mặc định (123456). Vì lý do bảo mật, vui lòng đặt lại mật khẩu mới trước khi tiếp tục.
          </div>
          <form className="form-grid" onSubmit={submitForceChangePass}>
            <Input
              label="Mật khẩu hiện tại (123456)"
              type="password"
              value={passForm.old_password}
              onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })}
              required
              placeholder="Nhập 123456"
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              value={passForm.new_password}
              onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
              required
              minLength={6}
              placeholder="Ít nhất 6 ký tự"
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={passForm.confirm_password}
              onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
              required
              minLength={6}
              placeholder="Nhập lại mật khẩu mới"
            />
            {passError && <div className="alert danger">{passError}</div>}
            <Button className="form-submit" type="submit" disabled={changingPass}>
              {changingPass ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default App;
