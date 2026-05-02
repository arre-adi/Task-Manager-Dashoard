import { Bell, CheckSquare, LayoutDashboard, Users, Search } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm } = useAppData();
  const location = useLocation();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const pageTitle = location.pathname.startsWith("/projects")
    ? "My Task"
    : location.pathname.startsWith("/teams")
      ? "Teams"
      : "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h1>Task Orbit.</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">
            <LayoutDashboard className="nav-icon" size={16} strokeWidth={1.9} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/projects">
            <CheckSquare className="nav-icon" size={16} strokeWidth={1.9} />
            <span>My Task</span>
          </NavLink>

          <NavLink to="/teams">
            <Users className="nav-icon" size={16} strokeWidth={1.9} />
            <span>Teams</span>
          </NavLink>
        </nav>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div className="page-heading">
            <h2>{pageTitle}</h2>
          </div>

          <label className="searchbox">
            <Search className="searchbox-icon" size={16} strokeWidth={1.9} />
            <input
              placeholder="Search or type a command"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell className="bell-icon" size={18} strokeWidth={1.9} />
              <span className="notification-dot" />
            </button>
          </div>

          <div className="profile-menu" tabIndex={0}>
            <button className="avatar-button" title={user.name} type="button">
              <div className="avatar">{initials}</div>
            </button>
            <div className="profile-popover">
              <strong>{user.name}</strong>
              <p>{user.email}</p>
              <button className="logout-popover-button" type="button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
