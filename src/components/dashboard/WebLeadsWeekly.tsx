import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { SiteData } from '@/services/api';
import { format, parseISO, startOfWeek, addWeeks, isBefore, isAfter } from 'date-fns';
import { Globe } from 'lucide-react';

const TABLE_START_DATE = new Date(2026, 3, 6); // 6th April 2026

interface WebLeadsWeeklyProps {
  webSites: SiteData[];
  isLoading?: boolean;
}

const START_DATE = new Date(2026, 2, 1); // 1st March 2026

const WebLeadsWeekly = ({ webSites, isLoading = false }: WebLeadsWeeklyProps) => {
  // Filter: exclude perse.energy emails, only include sites on/after 1st March 2026
  const filtered = (webSites || []).filter((s) => {
    const email = (s.contact_email || '').toLowerCase();
    if (email.includes('perse.energy')) return false;
    if (!s.onboard_date) return false;
    try {
      const d = parseISO(s.onboard_date);
      return !isBefore(d, START_DATE);
    } catch {
      return false;
    }
  });

  // Build weekly buckets from 1st March 2026 to current week (week starts Monday)
  const buckets: Record<string, { weekStart: Date; count: number }> = {};
  const firstWeekStart = startOfWeek(START_DATE, { weekStartsOn: 1 });
  const today = new Date();
  let cursor = firstWeekStart;
  while (!isAfter(cursor, today)) {
    const key = format(cursor, 'yyyy-MM-dd');
    buckets[key] = { weekStart: cursor, count: 0 };
    cursor = addWeeks(cursor, 1);
  }

  filtered.forEach((s) => {
    try {
      const d = parseISO(s.onboard_date);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(weekStart, 'yyyy-MM-dd');
      if (buckets[key]) buckets[key].count++;
    } catch {
      /* ignore */
    }
  });

  const chartData = Object.values(buckets)
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((b) => ({
      label: `W/C ${format(b.weekStart, 'dd MMM')}`,
      count: b.count,
    }));

  const total = filtered.length;

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-96 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Web Leads — Weekly View</h3>
      </div>

      <Card className="p-6 border-l-4 border-l-primary bg-accent/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground">Sites Added Per Week</h4>
            <p className="text-sm text-muted-foreground">
              From 1st March 2026 — excludes perse.energy emails
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total leads</p>
            <p className="text-3xl font-bold text-foreground">{total}</p>
          </div>
        </div>

        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads">
                <LabelList dataKey="count" position="top" fill="hsl(var(--foreground))" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default WebLeadsWeekly;
