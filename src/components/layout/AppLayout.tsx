import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Map, BarChart3, DollarSign, Shield, Users, Wrench, Box, Bell, Settings,
  ChevronLeft, Flame
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
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-semibold text-foreground">CaspiaGas</p>
                <p className="text-[10px] text-muted-foreground">Command Center</p>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
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
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center px-6 bg-card shrink-0">
          <p className="text-sm font-medium text-muted-foreground">
            CaspiaGas Command Center — Gas Distribution Intelligence
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
