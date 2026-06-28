import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout({ user, path, collapsed, onMenu, onLogout, navigate, children }) {
  return (
    <div className="app-layout">
      <Header user={user} onMenu={onMenu} onLogout={onLogout} />
      <div className="layout-body">
        <Sidebar
          role={user?.role}
          activePath={path}
          collapsed={collapsed}
          navigate={navigate}
        />
        <main className="main-content" key={path}>{children}</main>
      </div>
    </div>
  );
}
