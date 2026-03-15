import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { complaintsByArea as fallback } from "@/data/mockData";
import { useDashboard } from "@/hooks/useApiData";

const severityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

export function ComplaintsChart() {
  const { data } = useDashboard();
  const complaintsByArea = data?.complaintsByArea ?? fallback;
  return (
    <div className="glass-panel rounded-sm p-4 scada-bracket">
      <h3 className="scada-label mb-4">
        Complaint Density by Area
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={complaintsByArea} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={{ stroke: "hsl(220, 15%, 18%)" }} />
            <YAxis dataKey="area" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={{ stroke: "hsl(220, 15%, 18%)" }} width={60} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "2px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
            />
            <Bar dataKey="complaints" radius={[0, 1, 1, 0]} name="Complaints">
              {complaintsByArea.map((entry, index) => (
                <Cell key={index} fill={severityColors[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
