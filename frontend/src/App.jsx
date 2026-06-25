import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./styles/uis-theme.css";
import { AppLayout } from "./components/layout/AppLayout";
import { authService } from "./services/authService";
import { tokenStore } from "./services/api";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { WeeklySchedulePage } from "./pages/WeeklySchedulePage";
import { LecturersPage } from "./pages/LecturersPage";
import { ClassesPage } from "./pages/ClassesPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { AvailabilityPage } from "./pages/AvailabilityPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ComingSoonPage, ForbiddenPage } from "./pages/SimpleResourcePage";
import { UsersPage } from "./pages/UsersPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { CoursesPage } from "./pages/CoursesPage";
import { SemestersPage } from "./pages/SemestersPage";
import { RoomsPage } from "./pages/RoomsPage";
import { AssignmentHistoryPage } from "./pages/AssignmentHistoryPage";
import { Modal } from "./components/ui/Modal";
import { Input } from "./components/ui/Field";
import { Button } from "./components/ui/Button";

const routeRoles = {
  "/home": ["ADMIN", "HEAD", "LECTURER"],
  "/teaching-schedule/weekly": ["LECTURER", "ADMIN", "HEAD"],
  "/teaching-schedule/semester": ["LECTURER", "ADMIN", "HEAD"],
  "/lecturers": ["ADMIN", "HEAD"],
  "/classes": ["ADMIN", "HEAD", "LECTURER"],
  "/assignments": ["ADMIN", "HEAD", "LECTURER"],
  "/availability": ["ADMIN", "LECTURER"],
  "/reports": ["ADMIN", "HEAD", "LECTURER"],
  "/users": ["ADMIN"],
  "/courses": ["ADMIN"],
  "/semesters": ["ADMIN"],
  "/rooms": ["ADMIN"],
  "/departments": ["ADMIN"],
  "/assignment-history": ["ADMIN", "HEAD"],
  "/notifications": ["ADMIN", "HEAD", "LECTURER"],
  "/profile": ["LECTURER", "HEAD"],
};

function currentPath() {
  const path = window.location.pathname;
  return path === "/" ? "/home" : path;
}

function App() {
  const [path, setPath] = useState(currentPath());
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Password forced change state
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

  const page = useMemo(() => {
    if (!user && path !== "/login") return null;
    const allowed = routeRoles[path];
    if (allowed && !allowed.includes(user?.role)) return <ForbiddenPage />;

    if (path === "/home") return <HomePage user={user} navigate={navigate} />;
    if (path === "/teaching-schedule/weekly") return <WeeklySchedulePage user={user} />;
    if (path === "/teaching-schedule/semester") return <ComingSoonPage title="Thời khóa biểu dạng học kỳ" />;
    if (path === "/lecturers") return <LecturersPage user={user} />;
    if (path === "/classes") return <ClassesPage user={user} />;
    if (path === "/assignments") return <AssignmentsPage user={user} />;
    if (path === "/availability") return <AvailabilityPage user={user} />;
    if (path === "/reports") return <ReportsPage user={user} />;
    if (path === "/users") return <UsersPage />;
    if (path === "/departments") return <DepartmentsPage />;
    if (path === "/courses") return <CoursesPage />;
    if (path === "/semesters") return <SemestersPage />;
    if (path === "/rooms") return <RoomsPage />;
    if (path === "/assignment-history") return <AssignmentHistoryPage />;
    if (path === "/notifications") return <ComingSoonPage title="Thông báo từ ban quản trị" />;
    if (path === "/profile") return <ProfilePage user={user} onUserChange={setUser} />;
    return <HomePage user={user} navigate={navigate} />;
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
      await authService.changePassword({
        old_password: passForm.old_password || undefined,
        new_password: passForm.new_password,
      });
      const updatedUser = await authService.getMe();
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

      {user?.must_change_password && (
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
              {changingPass ? "Đang đổi mật khẩu..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default App;
