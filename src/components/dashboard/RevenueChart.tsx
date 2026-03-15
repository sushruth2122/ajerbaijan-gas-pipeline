import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { revenueVsConsumption as fallback } from "@/data/mockData";
import { useDashboard } from "@/hooks/useApiData";

export function RevenueChart() {
  const { data } = useDashboard();
  const revenueVsConsumption = data?.revenueVsConsumption ?? fallback;
  return (
    <div className="glass-panel rounded-sm p-4 scada-bracket">
      <h3 className="scada-label mb-4">
        Revenue vs Consumption (Monthly)
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueVsConsumption}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={{ stroke: "hsl(220, 15%, 18%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={{ stroke: "hsl(220, 15%, 18%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "2px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="revenue" fill="hsl(190, 85%, 42%)" radius={[1, 1, 0, 0]} name="Revenue (AZN M)" />
            <Bar dataKey="consumption" fill="hsl(40, 92%, 52%)" radius={[1, 1, 0, 0]} name="Consumption (M m³)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
