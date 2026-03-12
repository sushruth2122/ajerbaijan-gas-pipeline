import { Settings, Monitor, Bell, Shield, Database, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { icon: Monitor, title: "Display & Theme", desc: "Configure dashboard layout, theme preferences, and widget visibility." },
  { icon: Bell, title: "Notification Settings", desc: "Manage alert thresholds, notification channels, and escalation rules." },
  { icon: Shield, title: "Security & Access", desc: "User roles, authentication, and access control configuration." },
  { icon: Database, title: "Data Sources", desc: "Configure SCADA connections, sensor integrations, and data pipelines." },
  { icon: Users, title: "User Management", desc: "Manage operators, administrators, and field crew accounts." },
  { icon: Settings, title: "System Configuration", desc: "General system parameters, API keys, and service health monitoring." },
];

const SystemSettings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Platform configuration & administration</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map(s => (
        <Card key={s.title} className="bg-card border-border hover:glow-primary transition-shadow duration-300 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10"><s.icon className="w-5 h-5 text-primary" /></div>
              <CardTitle className="text-sm font-semibold">{s.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default SystemSettings;
