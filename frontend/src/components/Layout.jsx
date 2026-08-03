import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { roleViews, viewLabels } from "../lib/routes";

export function Topbar({ user, view, setView, onLogout }) {
  const views = roleViews[user?.role || "guest"] || roleViews.guest;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="mark">
          <ShieldCheck size={24} />
        </div>
        <div>
          <strong>Government Portal</strong>
          <span>Government project monitoring and fraud detection platform</span>
        </div>
      </div>

      <nav className="nav">
        {views.map((item) => (
          <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
            {viewLabels[item]}
          </button>
        ))}
      </nav>

      <div className="userbar">
        <span className="muted">{user ? `${user.full_name} · ${user.role}` : "Guest"}</span>
        {user && (
          <button className="ghost-btn icon-btn" onClick={onLogout} title="Sign out">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export function Sidebar({ apiBase, role, onRefresh }) {
  return (
    <aside className="sidebar">
      <section className="panel">
        <h2>Control Panel</h2>
        <p className="muted">Connected to {apiBase}</p>
        <button className="ghost-btn with-icon" onClick={onRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>
      <section className="card">
        <h3>Role access</h3>
        <p className="muted">Current role: {role}. Actions are limited to endpoints this role can call.</p>
      </section>
    </aside>
  );
}
