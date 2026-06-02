"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ChartIcon,
  SettingsIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  ClipboardIcon,
  CalendarIcon,
} from "@/presentation/components/icons";
import Logo from "@/presentation/components/Logo";
import LogoutButton from "@/presentation/components/LogoutButton";

/* ─── Navigation config ──────────────────────────────────────── */
const NAV_GROUPS = [
  {
    group: "MENU",
    items: [
      { label: "Dashboard",    href: "/dashboard",              icon: HomeIcon  },
      { label: "Analytics",    href: "/dashboard/analytics",    icon: ChartIcon },
    ],
  },
  {
    group: "PATIENTS",
    items: [
      { label: "All Patients",    href: "/dashboard/patients",       icon: UsersIcon     },
      { label: "Appointments",   href: "/dashboard/appointments",   icon: CalendarIcon  },
      { label: "Prescriptions",  href: "/dashboard/prescriptions",  icon: ClipboardIcon },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { label: "User Accounts", href: "/dashboard/users",    icon: UsersIcon    },
      { label: "Security",      href: "/dashboard/security", icon: ShieldIcon   },
      { label: "Settings",      href: "/dashboard/settings", icon: SettingsIcon },
    ],
  },
];

/* ─── Bell icon (inline) ─────────────────────────────────────── */
const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round"
    strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

/* ─── Chevron icon ───────────────────────────────────────────── */
const ChevronRight = () => (
  <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round"
    strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

/* ─── Sidebar icon wrapper ───────────────────────────────────── */
const MenuIcon = () => (
  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round"
    strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

/* ─── Layout component ───────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--content-bg)" }}>

      {/* ─── Sidebar ──────────────────────────────────────────── */}
      <aside
        style={{
          width: collapsed ? "72px" : "var(--sidebar-width)",
          minWidth: collapsed ? "72px" : "var(--sidebar-width)",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          position: "relative",
          zIndex: 40,
        }}
      >
        {/* Logo area */}
        <div style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 18px" : "0 24px",
          borderBottom: "1px solid var(--sidebar-border)",
          flexShrink: 0,
          gap: "12px",
        }}>
          {collapsed ? (
            <Logo size={36} variant="icon" />
          ) : (
            <Logo size={36} variant="full" dark />
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.group} style={{ marginBottom: "8px" }}>
              {!collapsed && (
                <div style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
                  color: "rgba(120,148,175,0.5)", padding: "2px 12px 8px",
                  textTransform: "uppercase",
                }}>
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: collapsed ? "11px 18px" : "11px 14px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      background: active ? "var(--sidebar-active-bg)" : "transparent",
                      color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                      fontWeight: active ? 700 : 500,
                      fontSize: "13.5px",
                      whiteSpace: "nowrap",
                      transition: "all 0.18s ease",
                      position: "relative",
                      marginBottom: "2px",
                      borderLeft: active ? `3px solid var(--sidebar-active-indicator)` : "3px solid transparent",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-hover)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    <Icon width={18} height={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && (
                      <span style={{ marginLeft: "auto" }}>
                        <ChevronRight />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* New Prescription quick-action */}
        {!collapsed && (
          <div style={{ padding: "12px 14px" }}>
            <Link
              href="/dashboard/prescriptions/new"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "11px", borderRadius: "10px", textDecoration: "none",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff", fontWeight: 700, fontSize: "13px",
                boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              <PlusIcon width={16} height={16} />
              New Prescription
            </Link>
          </div>
        )}

        {/* User card */}
        <div style={{
          padding: collapsed ? "12px 10px" : "12px 14px",
          borderTop: "1px solid var(--sidebar-border)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px", borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
          }}>
            {/* Avatar */}
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "#fff", fontSize: "13px",
            }}>DS</div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Dr. Smith
                </div>
                <div style={{ fontSize: "11px", color: "var(--sidebar-text)", whiteSpace: "nowrap" }}>Cardiologist</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main column ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* ─── Topbar ─────────────────────────────────────────── */}
        <header style={{
          height: "var(--topbar-height)",
          background: "var(--topbar-bg)",
          borderBottom: `1px solid var(--topbar-border)`,
          display: "flex", alignItems: "center",
          padding: "0 28px",
          gap: "16px",
          flexShrink: 0,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          zIndex: 30,
        }}>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "8px",
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer", flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; (e.currentTarget as HTMLElement).style.color = "#1e293b"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: "420px", position: "relative" }}>
            <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
              <SearchIcon style={{ width: "15px", height: "15px" }} />
            </div>
            <input
              type="text"
              placeholder="Search patients, prescriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: "38px", borderRadius: "9px",
                border: "1px solid #e2e8f0", background: "#f8fafc",
                padding: "0 14px 0 38px", fontSize: "13.5px",
                color: "var(--text-primary)", outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Notification bell */}
          <button style={{
            position: "relative", display: "flex", alignItems: "center",
            justifyContent: "center", width: "38px", height: "38px",
            borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff",
            color: "#64748b", cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; (e.currentTarget as HTMLElement).style.color = "#1e293b"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
            aria-label="Notifications"
          >
            <BellIcon size={17} />
            <span className="pulse-dot" style={{
              position: "absolute", top: "7px", right: "7px",
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#ef4444", border: "1.5px solid #fff",
            }} />
          </button>

          {/* Profile chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px",
            borderRadius: "40px", border: "1px solid #e2e8f0", background: "#fff",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}
          >
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "#fff", fontSize: "11px",
            }}>DS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", lineHeight: 1.2 }}>Dr. Smith</div>
              <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>Admin</div>
            </div>
          </div>

          {/* Logout */}
          <LogoutButton
            variant="icon"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "38px", height: "38px", borderRadius: "9px",
              border: "1px solid #fecaca", background: "#fff",
              color: "#ef4444", cursor: "pointer", flexShrink: 0,
              transition: "all 0.2s",
            }}
          />
        </header>

        {/* ─── Page content ────────────────────────────────────── */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 32px",
          background: "var(--content-bg)",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
