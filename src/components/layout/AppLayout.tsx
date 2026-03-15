import { ReactNode, useEffect, useState as useStateReact } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Map, BarChart3, DollarSign, Shield, Users, Wrench, Box, Bell, Settings,
  ChevronLeft, Flame, Radio, Wifi, Activity
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Overview", path: "/", icon: LayoutDashboard },
  { title: "Network Map", path: "/digital-twin", icon: Map },
  { title: "Smart Meters", path: "/smart-meters", icon: BarChart3 },
  { title: "Revenue", path: "/revenue", icon: DollarSign },
  { title: "Safety", path: "/safety", icon: Shield },
  { title: "Customers", path: "/customers", icon: Users },
  { title: "Workforce", path: "/workforce", icon: Wrench },
  { title: "Assets", path: "/assets", icon: Box },
  { title: "Alerts", path: "/alerts", icon: Bell },
  { title: "Settings", path: "/settings", icon: Settings },
];

function SystemClock() {
  const [time, setTime] = useStateReact(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums text-primary tracking-wider">
      {time.toLocaleTimeString("en-GB", { hour12: false })}
    </span>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 260 }}
        transition={{ duration: 0.2 }}
        className="h-full flex flex-col border-r border-border bg-sidebar shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(190_85%_42%/0.5)]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold text-foreground tracking-wide">CASPIA<span className="text-primary">GAS</span></p>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.15em]">Command Center</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 group uppercase tracking-wide ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_12px_hsl(190_85%_42%/0.08)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent"
                }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary drop-shadow-[0_0_4px_hsl(190_85%_42%/0.4)]" : ""}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* System status at sidebar bottom */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 border-t border-border text-[10px] font-mono text-muted-foreground space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-scada-glow" />
                <span>SYS NOMINAL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>SCADA LINK: ACTIVE</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-border hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </motion.aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* SCADA Header Bar */}
        <header className="h-10 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-primary animate-scada-glow" />
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Gas Distribution Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicators */}
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-mono text-emerald-500">ONLINE</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground">TELEMETRY</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <SystemClock />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
