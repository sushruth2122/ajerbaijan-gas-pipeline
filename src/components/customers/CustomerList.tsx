import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchFilterBar } from "@/components/assets/SearchFilterBar";
import { Users, Building2, Factory } from "lucide-react";

interface Customer {
  customer_id: string;
  name: string;
  category: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
  meter_id: string;
  status: string;
  connection_date: string;
  monthly_consumption: number;
  last_bill_amount: number;
  payment_status: string;
}

interface DistributionSummary {
  total: number;
  byCategory: { smart: number; commercial: number; industrial: number };
  byRegion: { region: string; count: number }[];
  byDistrict: { district: string; count: number }[];
}

interface CustomerListProps {
  customers: Customer[];
  summary: DistributionSummary;
}

const categoryBadge = (cat: string) => {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    smart: { cls: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Users className="w-3 h-3 mr-1" /> },
    commercial: { cls: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <Building2 className="w-3 h-3 mr-1" /> },
    industrial: { cls: "bg-red-500/20 text-red-400 border-red-500/30", icon: <Factory className="w-3 h-3 mr-1" /> },
  };
  const cfg = map[cat] || map.smart;
  return <Badge className={cfg.cls}>{cfg.icon}{cat}</Badge>;
};

const statusBadge = (status: string) => {
  if (status === "active") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>;
  return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
};

const paymentBadge = (ps: string) => {
  if (ps === "paid") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>;
  if (ps === "overdue") return <Badge variant="destructive">Overdue</Badge>;
  return <Badge className="bg-muted text-muted-foreground">N/A</Badge>;
};

export function CustomerList({ customers, summary }: CustomerListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const regions = useMemo(() => [...new Set(customers.map(c => c.region))].sort(), [customers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c => {
      if (q && !(`${c.customer_id} ${c.name} ${c.district} ${c.region} ${c.meter_id}`).toLowerCase().includes(q)) return false;
      if (categoryFilter && c.category !== categoryFilter.toLowerCase()) return false;
      if (regionFilter && c.region !== regionFilter) return false;
      if (statusFilter && c.status !== statusFilter.toLowerCase()) return false;
      if (paymentFilter && c.payment_status !== paymentFilter.toLowerCase()) return false;
      return true;
    });
  }, [customers, search, categoryFilter, regionFilter, statusFilter, paymentFilter]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <span className="text-xs font-medium text-muted-foreground">Total Customers</span>
            <p className="text-2xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">Smart (Household)</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{summary.byCategory.smart}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">Commercial</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{summary.byCategory.commercial}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Industrial</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{summary.byCategory.industrial}</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Customer Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, name, district, region, meter..."
            resultCount={filtered.length}
            totalCount={customers.length}
            filters={[
              { label: "All Categories", value: categoryFilter, options: ["Smart", "Commercial", "Industrial"], onChange: setCategoryFilter },
              { label: "All Regions", value: regionFilter, options: regions, onChange: setRegionFilter },
              { label: "All Status", value: statusFilter, options: ["Active", "Inactive"], onChange: setStatusFilter },
              { label: "All Payments", value: paymentFilter, options: ["Paid", "Overdue"], onChange: setPaymentFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">District</TableHead>
                  <TableHead className="text-xs">Region</TableHead>
                  <TableHead className="text-xs">Meter</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Monthly (m³)</TableHead>
                  <TableHead className="text-xs text-right">Last Bill</TableHead>
                  <TableHead className="text-xs">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.customer_id}>
                    <TableCell className="font-mono text-xs">{c.customer_id}</TableCell>
                    <TableCell className="text-xs">{c.name}</TableCell>
                    <TableCell>{categoryBadge(c.category)}</TableCell>
                    <TableCell className="text-xs">{c.district}</TableCell>
                    <TableCell className="text-xs">{c.region}</TableCell>
                    <TableCell className="font-mono text-xs">{c.meter_id}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="text-xs text-right">{c.monthly_consumption.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right">${c.last_bill_amount.toLocaleString()}</TableCell>
                    <TableCell>{paymentBadge(c.payment_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
