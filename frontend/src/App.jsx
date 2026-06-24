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
import { ComingSoonPage, ForbiddenPage, SimpleResourcePage } from "./pages/SimpleResourcePage";

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
  "/assignment-history": ["ADMIN", "HEAD"],
  "/notifications": ["ADMIN", "HEAD", "LECTURER"],
  "/profile": ["LECTURER"],
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

    if (path === "/home") return <HomePage user={user} />;
    if (path === "/teaching-schedule/weekly") return <WeeklySchedulePage user={user} />;
    if (path === "/teaching-schedule/semester") return <ComingSoonPage title="Thời khóa biểu dạng học kỳ" />;
    if (path === "/lecturers") return <LecturersPage user={user} />;
    if (path === "/classes") return <ClassesPage user={user} />;
    if (path === "/assignments") return <AssignmentsPage user={user} />;
    if (path === "/availability") return <AvailabilityPage user={user} />;
    if (path === "/reports") return <ReportsPage user={user} />;
    if (path === "/users") return <SimpleResourcePage type="users" />;
    if (path === "/courses") return <SimpleResourcePage type="courses" />;
    if (path === "/semesters") return <SimpleResourcePage type="semesters" />;
    if (path === "/rooms") return <SimpleResourcePage type="rooms" />;
    if (path === "/assignment-history") return <SimpleResourcePage type="history" />;
    if (path === "/notifications") return <ComingSoonPage title="Thông báo từ ban quản trị" />;
    if (path === "/profile") return <ProfilePage user={user} onUserChange={setUser} />;
    return <HomePage user={user} />;
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
    </AppLayout>
  );
}

export default App;
