import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { consumptionTrend as fallback } from "@/data/mockData";
import { useDashboard } from "@/hooks/useApiData";

export function ConsumptionChart() {
  const { data } = useDashboard();
  const consumptionTrend = data?.consumptionTrend ?? fallback;
  return (
    <div className="glass-panel rounded-sm p-4 scada-bracket">
      <h3 className="scada-label mb-4">
        City Gas Consumption Trend (Today)
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={consumptionTrend}>
            <defs>
              <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 80%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(190, 80%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} axisLine={{ stroke: "hsl(220, 15%, 18%)" }} />
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
            <Area type="monotone" dataKey="baseline" stroke="hsl(215, 15%, 35%)" strokeDasharray="4 4" fill="none" name="Baseline" />
            <Area type="monotone" dataKey="consumption" stroke="hsl(190, 80%, 45%)" fill="url(#consumptionGrad)" strokeWidth={2} name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
