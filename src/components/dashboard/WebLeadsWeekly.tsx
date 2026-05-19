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
import { format, parseISO, startOfWeek, addWeeks, isBefore, isAfter, startOfDay, addDays, isSameDay, subDays } from 'date-fns';
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

  const weeklyLoggedIn: Record<string, number> = {};
  const weeklyEmailOpened: Record<string, number> = {};
  const hasEmailOpened = (s: SiteData) => {
    if ((s.email_open_count ?? 0) > 0) return true;
    const shared = s.shared_contacts_email_status;
    if (shared && typeof shared === 'object') {
      for (const k of Object.keys(shared)) {
        if ((shared[k]?.email_open_count ?? 0) > 0) return true;
      }
    }
    return false;
  };
  filtered.forEach((s) => {
    try {
      const d = parseISO(s.onboard_date);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(weekStart, 'yyyy-MM-dd');
      if (buckets[key]) {
        buckets[key].count++;
        if (s.last_login_time) weeklyLoggedIn[key] = (weeklyLoggedIn[key] || 0) + 1;
        if (hasEmailOpened(s)) weeklyEmailOpened[key] = (weeklyEmailOpened[key] || 0) + 1;
      }
    } catch {
      /* ignore */
    }
  });

  const chartData = Object.values(buckets)
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((b) => {
      const key = format(b.weekStart, 'yyyy-MM-dd');
      return {
        label: `W/C ${format(b.weekStart, 'dd MMM')}`,
        count: b.count,
        loggedIn: weeklyLoggedIn[key] || 0,
        emailOpened: weeklyEmailOpened[key] || 0,
      };
    });

  const total = filtered.length;
  const totalLoggedIn = filtered.filter((s) => !!s.last_login_time).length;
  const totalEmailOpened = filtered.filter(hasEmailOpened).length;

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
            <p className="text-xs text-muted-foreground mt-1">
              Logged in: <span className="font-semibold text-foreground">{totalLoggedIn}</span>
              {total > 0 && ` (${Math.round((totalLoggedIn / total) * 100)}%)`}
            </p>
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
              <Bar dataKey="loggedIn" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} name="Logged In">
                <LabelList dataKey="loggedIn" position="top" fill="hsl(25 95% 40%)" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {(() => {
        // Last 7 days including today
        const today = startOfDay(new Date());
        const days: { date: Date; label: string; count: number; loggedIn: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(today, i);
          days.push({ date: d, label: format(d, 'EEE dd MMM'), count: 0, loggedIn: 0 });
        }
        filtered.forEach((s) => {
          try {
            const d = startOfDay(parseISO(s.onboard_date));
            const bucket = days.find((x) => isSameDay(x.date, d));
            if (bucket) {
              bucket.count++;
              if (s.last_login_time) bucket.loggedIn++;
            }
          } catch {
            /* ignore */
          }
        });
        const dailyTotal = days.reduce((a, b) => a + b.count, 0);
        const dailyLoggedIn = days.reduce((a, b) => a + b.loggedIn, 0);

        return (
          <Card className="p-6 border-l-4 border-l-primary bg-accent/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground">Sites Added — Last 7 Days</h4>
                <p className="text-sm text-muted-foreground">
                  Day-by-day breakdown — excludes perse.energy emails
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total (7 days)</p>
                <p className="text-3xl font-bold text-foreground">{dailyTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Logged in: <span className="font-semibold text-foreground">{dailyLoggedIn}</span>
                  {dailyTotal > 0 && ` (${Math.round((dailyLoggedIn / dailyTotal) * 100)}%)`}
                </p>
              </div>
            </div>

            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-30}
                    textAnchor="end"
                    height={60}
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
                  <Bar dataKey="loggedIn" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} name="Logged In">
                    <LabelList dataKey="loggedIn" position="top" fill="hsl(25 95% 40%)" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        );
      })()}

      {(() => {
        const tableSites = filtered
          .filter((s) => {
            try {
              return !isBefore(parseISO(s.onboard_date), TABLE_START_DATE);
            } catch {
              return false;
            }
          })
          .sort((a, b) => (a.onboard_date < b.onboard_date ? 1 : -1));

        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground">Web Leads Detail</h4>
                <p className="text-sm text-muted-foreground">
                  From week starting 6th April 2026 — excludes perse.energy emails
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{tableSites.length}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Onboard Date</TableHead>
                    <TableHead>Site Address</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableSites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No web leads from 6th April 2026 onwards
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableSites.map((s, i) => (
                      <TableRow key={`${s.siteId || i}-${i}`}>
                        <TableCell>
                          {(() => {
                            try {
                              return format(parseISO(s.onboard_date), 'dd MMM yyyy');
                            } catch {
                              return s.onboard_date || '-';
                            }
                          })()}
                        </TableCell>
                        <TableCell>{s.siteAddress || '-'}</TableCell>
                        <TableCell>{s.contact_name || '-'}</TableCell>
                        <TableCell>{s.contact_email || '-'}</TableCell>
                        <TableCell>{s.contact_phone || '-'}</TableCell>
                        <TableCell>{s.agent_name || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        );
      })()}
    </div>
  );
};

export default WebLeadsWeekly;
