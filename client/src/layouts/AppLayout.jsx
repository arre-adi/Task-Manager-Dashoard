import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Search,
  LogOut
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useAppData } from "../hooks/useAppData.js";
import { getAvatarUrl } from "../utils/avatar.js";

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
    ? "My Tasks"
    : location.pathname.startsWith("/teams")
      ? "Teams"
      : "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h1>Task Orbit</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">
            <LayoutDashboard className="nav-icon" size={17} strokeWidth={1.9} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/projects">
            <ClipboardList className="nav-icon" size={17} strokeWidth={1.9} />
            <span>My Tasks</span>
          </NavLink>

          <NavLink to="/teams">
            <Users className="nav-icon" size={17} strokeWidth={1.9} />
            <span>Teams</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {user.avatarUrl ? (
                <img
                  alt={user.name}
                  src={getAvatarUrl(user.avatarUrl)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="sidebar-user__info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="sidebar-footer__button" type="button" onClick={logout}>
            <LogOut className="nav-icon" size={17} strokeWidth={1.9} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div className="page-heading">
            <h2>{pageTitle}</h2>
          </div>

          <label className="searchbox">
            <Search className="searchbox-icon" size={16} strokeWidth={1.9} />
            <input
              placeholder="Search tasks, projects, or people"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="topbar-avatar" title={user.name}>
            {user.avatarUrl ? (
              <img
                alt={user.name}
                className="avatar"
                src={getAvatarUrl(user.avatarUrl)}
              />
            ) : (
              <div className="avatar">{initials}</div>
            )}
          </div>
        </header>

        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
