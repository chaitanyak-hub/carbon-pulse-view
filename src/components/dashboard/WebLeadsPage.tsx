import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  Building2,
  Share2,
  Calendar,
  MailOpen,
  Download,
  FileSpreadsheet,
  Globe,
  Search,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  addWeeks,
  addMonths,
  isWithinInterval,
} from 'date-fns';
import { SiteData, calculateKPIs } from '@/services/api';
import { exportToExcel, generateFilename } from '@/utils/dataExport';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface WebLeadsPageProps {
  webSites: SiteData[];
  nonWebSites: SiteData[];
  isLoading?: boolean;
}

const inRange = (site: SiteData, start: Date, end: Date) => {
  if (!site.onboard_date) return false;
  try {
    return isWithinInterval(parseISO(site.onboard_date), { start, end });
  } catch {
    return false;
  }
};

const KpiTile = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: any;
  gradient: string;
}) => (
  <Card
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white p-5 rounded-xl shadow-lg`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium opacity-90">{title}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
    </div>
  </Card>
);

const KpiBlock = ({ sites, label }: { sites: SiteData[]; label: string }) => {
  const k = calculateKPIs(sites);
  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold text-foreground">{label} ({sites.length} sites)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiTile
          title="Total Sites Onboarded"
          value={k.totalSites}
          subtitle="Total pipeline entries"
          icon={Building2}
          gradient="from-primary to-primary/80"
        />
        <KpiTile
          title="Total Sites Shared"
          value={k.sharedSites}
          subtitle={`${k.shareRate.toFixed(1)}% share rate`}
          icon={Share2}
          gradient="from-blue-500 to-blue-600"
        />
        <KpiTile
          title="Emails Opened"
          value={k.emailOpened}
          subtitle={`${k.emailOpenRate.toFixed(1)}% open rate`}
          icon={MailOpen}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

    </div>
  );
};

const computeMetrics = (sites: SiteData[]) => {
  const k = calculateKPIs(sites);
  return {
    onboarded: k.totalSites,
    shared: k.sharedSites,
    appointments: k.sitesWithAppointments,
    emailsOpened: k.emailOpened,
  };
};

const PeriodComparisonChart = ({
  data,
  title,
  subtitle,
}: {
  data: any[];
  title: string;
  subtitle: string;
}) => (
  <Card className="p-6 border-l-4 border-l-primary bg-accent/30">
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-30}
            textAnchor="end"
            height={70}
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
          <Legend />
          <Bar dataKey="onboarded" fill="hsl(var(--primary))" name="Onboarded" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="onboarded" position="top" fontSize={10} />
          </Bar>
          <Bar dataKey="shared" fill="hsl(217 91% 60%)" name="Shared" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="shared" position="top" fontSize={10} />
          </Bar>
          <Bar dataKey="emailsOpened" fill="hsl(38 92% 50%)" name="Emails Opened" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="emailsOpened" position="top" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const MARCH_2026 = new Date(2026, 2, 1);

const buildEngagementBuckets = (
  sites: SiteData[],
  granularity: 'month' | 'week'
) => {
  const now = new Date();
  const buckets: { label: string; start: Date; end: Date }[] = [];
  if (granularity === 'month') {
    let cur = startOfMonth(MARCH_2026);
    while (cur <= now) {
      buckets.push({ label: format(cur, 'MMM yyyy'), start: cur, end: endOfMonth(cur) });
      cur = addMonths(cur, 1);
    }
  } else {
    let cur = startOfWeek(MARCH_2026, { weekStartsOn: 1 });
    while (cur <= now) {
      buckets.push({
        label: `W/C ${format(cur, 'dd MMM yyyy')}`,
        start: cur,
        end: endOfWeek(cur, { weekStartsOn: 1 }),
      });
      cur = addWeeks(cur, 1);
    }
  }
  return buckets.map((b) => {
    const subset = sites.filter((s) => inRange(s, b.start, b.end));
    const sends = subset.length;
    const uniqueOpens = subset.filter((s) => (s.email_open_count ?? 0) > 0).length;
    const openRate = sends > 0 ? (uniqueOpens / sends) * 100 : 0;
    return { label: b.label, sends, uniqueOpens, openRate };
  });
};

const EmailEngagementBreakdown = ({ sites }: { sites: SiteData[] }) => {
  const monthly = useMemo(() => buildEngagementBuckets(sites, 'month'), [sites]);
  const weekly = useMemo(() => buildEngagementBuckets(sites, 'week'), [sites]);

  const totalSends = sites.filter((s) => {
    if (!s.onboard_date) return false;
    try { return parseISO(s.onboard_date) >= MARCH_2026; } catch { return false; }
  }).length;
  const totalOpens = sites.filter((s) => {
    if (!s.onboard_date) return false;
    try { return parseISO(s.onboard_date) >= MARCH_2026 && (s.email_open_count ?? 0) > 0; } catch { return false; }
  }).length;
  const totalRate = totalSends > 0 ? (totalOpens / totalSends) * 100 : 0;

  const renderTable = (rows: typeof monthly, headerLabel: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">{headerLabel}</TableHead>
          <TableHead className="font-bold text-right">Total Sends (Sites)</TableHead>
          <TableHead className="font-bold text-right">Total Unique Opens</TableHead>
          <TableHead className="font-bold text-right">Open Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.label}>
            <TableCell className="font-medium">{r.label}</TableCell>
            <TableCell className="text-right">{r.sends.toLocaleString()}</TableCell>
            <TableCell className="text-right">{r.uniqueOpens.toLocaleString()}</TableCell>
            <TableCell className="text-right">{r.openRate.toFixed(2)}%</TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">{totalSends.toLocaleString()}</TableCell>
          <TableCell className="text-right">{totalOpens.toLocaleString()}</TableCell>
          <TableCell className="text-right">{totalRate.toFixed(2)}%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-foreground">Email Engagement — From March 2026</h4>
        <p className="text-sm text-muted-foreground">Total Sends, Unique Opens and Open Rate by period</p>
      </div>
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month by Month</TabsTrigger>
          <TabsTrigger value="week">Week by Week</TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <div className="overflow-x-auto">{renderTable(monthly, 'Month')}</div>
        </TabsContent>
        <TabsContent value="week">
          <div className="overflow-x-auto">{renderTable(weekly, 'Week Commencing')}</div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const WebLeadsPage = ({ webSites, nonWebSites, isLoading }: WebLeadsPageProps) => {

  const { toast } = useToast();
  const [source, setSource] = useState<'web' | 'nonweb' | 'all'>('web');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter web sites: exclude perse.energy
  const cleanWeb = useMemo(
    () =>
      (webSites || []).filter(
        (s) => !(s.contact_email || '').toLowerCase().includes('perse.energy')
      ),
    [webSites]
  );

  const activeSites = useMemo(() => {
    if (source === 'web') return cleanWeb;
    if (source === 'nonweb') return nonWebSites || [];
    return [...cleanWeb, ...(nonWebSites || [])];
  }, [source, cleanWeb, nonWebSites]);

  const filteredSites = useMemo(() => {
    if (!searchTerm.trim()) return activeSites;
    const term = searchTerm.toLowerCase();
    return activeSites.filter((s) =>
      (s.siteId || '').toLowerCase().includes(term) ||
      (s.siteAddress || '').toLowerCase().includes(term) ||
      (s.agent_name || '').toLowerCase().includes(term) ||
      (s.contact_first_name || '').toLowerCase().includes(term) ||
      (s.contact_last_name || '').toLowerCase().includes(term) ||
      (s.contact_email || '').toLowerCase().includes(term) ||
      Object.keys(s.elecMeter || {}).some((m) => m.toLowerCase().includes(term))
    );
  }, [activeSites, searchTerm]);

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const wtdStart = startOfWeek(now, { weekStartsOn: 1 });
  const mtdStart = startOfMonth(now);

  const todaySites = activeSites.filter((s) => inRange(s, todayStart, todayEnd));
  const yesterdaySites = activeSites.filter((s) => inRange(s, yesterdayStart, yesterdayEnd));
  const wtdSites = activeSites.filter((s) => inRange(s, wtdStart, todayEnd));
  const mtdSites = activeSites.filter((s) => inRange(s, mtdStart, todayEnd));

  // Week-on-week last 8 weeks
  const wowData = useMemo(() => {
    const rows: any[] = [];
    for (let i = 7; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      const subset = activeSites.filter((s) => inRange(s, ws, we));
      rows.push({
        label: `W/C ${format(ws, 'dd MMM')}`,
        ...computeMetrics(subset),
      });
    }
    return rows;
  }, [activeSites]);

  // Month-on-month last 6 months
  const momData = useMemo(() => {
    const rows: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i));
      const me = endOfMonth(ms);
      const subset = activeSites.filter((s) => inRange(s, ms, me));
      rows.push({
        label: format(ms, 'MMM yyyy'),
        ...computeMetrics(subset),
      });
    }
    return rows;
  }, [activeSites]);

  const handleCombinedExport = () => {
    const web = cleanWeb;
    const nonWeb = nonWebSites || [];
    if (web.length === 0 && nonWeb.length === 0) {
      toast({ title: 'No data', description: 'Nothing to export.', variant: 'destructive' });
      return;
    }
    try {
      const tag = (arr: SiteData[], source: string) =>
        arr.map((s) => ({ Source: source, ...flatten(s) }));
      const flatten = (s: SiteData) => ({
        'Site ID': s.siteId,
        'Onboard Date': s.onboard_date,
        'Agent Name': s.agent_name,
        'Site Address': s.siteAddress,
        'Contact First Name': s.contact_first_name,
        'Contact Last Name': s.contact_last_name,
        'Contact Email': s.contact_email,
        'Contact Phone': s.contact_phone,
        'Consent': s.consent,
        'Consent Type': s.consent_type,
        'Site Status': s.site_status,
        'Is Shared': s.is_shared,
        'Share Count': s.share_count,
        'Last Shared Date': s.last_shared_date,
        'Has Appointment': s.has_appointment,
        'Appointment Date': s.appointment_date,
        'Appointment Time From': s.appointment_time_from,
        'Appointment Status': s.appointment_status,
        'Email Send Count': s.email_send_count,
        'Email Delivered': s.email_delivered,
        'Email Open Count': s.email_open_count,
        'Last Login': s.last_login_time,
        'Login Count': s.login_count,
        'Property Type': s.property_type,
        'Bedrooms': s.no_of_bedrooms,
        'Current EPC Rating': s.current_epc_rating,
        'Annual Elec (kWh)': s.annual_elec_consumption,
        'Annual Gas (kWh)': s.annual_gas_consumption,
        'MPAN': Object.keys(s.elecMeter || {}).join(', ') || '',
      });

      const combined = [...tag(web, 'WEB'), ...tag(nonWeb, 'NON-WEB')];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(combined), 'All Leads');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tag(web, 'WEB')), 'Web Leads');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tag(nonWeb, 'NON-WEB')), 'Non-Web Leads');
      const headers = combined.length ? Object.keys(combined[0]) : [];
      wb.Sheets['All Leads']['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));
      XLSX.writeFile(wb, `${generateFilename('all-leads-combined')}.xlsx`);
      toast({
        title: 'Export Successful',
        description: `Downloaded ${combined.length} records (${web.length} web + ${nonWeb.length} non-web).`,
      });
    } catch (e) {
      toast({ title: 'Export Failed', description: 'Could not export data.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-96 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Web Leads — KPI & Trends</h3>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={source} onValueChange={(v) => setSource(v as any)}>
            <TabsList>
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="nonweb">Non-Web</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleCombinedExport} className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Download Combined Excel
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <KpiBlock sites={todaySites} label="Today" />
        <KpiBlock sites={yesterdaySites} label="Yesterday" />
        <KpiBlock sites={wtdSites} label="Week to Date" />
        <KpiBlock sites={mtdSites} label="Month to Date" />
      </Card>

      <EmailEngagementBreakdown sites={activeSites} />

      <PeriodComparisonChart
        data={wowData}
        title="Week on Week — Last 8 Weeks"
        subtitle="Onboarded, Shared, Appointments and Emails Opened per week"
      />


      <PeriodComparisonChart
        data={momData}
        title="Month on Month — Last 6 Months"
        subtitle="Onboarded, Shared, Appointments and Emails Opened per month"
      />

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h4 className="text-lg font-semibold text-foreground">
            Site Details — {filteredSites.length} of {activeSites.length} sites
          </h4>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, address, name, email, MPAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold whitespace-nowrap">Site ID</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Onboard Date</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Site Address</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Contact Name</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Contact Email</TableHead>
                <TableHead className="font-bold whitespace-nowrap">MPAN</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Shared</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Appointment</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Email Opened</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Open Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs whitespace-nowrap">{site.siteId}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {site.onboard_date ? new Date(site.onboard_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate whitespace-nowrap" title={site.siteAddress || ''}>
                    {site.siteAddress || 'N/A'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {[site.contact_first_name, site.contact_last_name].filter(Boolean).join(' ') || 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{site.contact_email || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {Object.keys(site.elecMeter || {}).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={site.is_shared === 'YES' || site.is_shared === true ? 'default' : 'secondary'}
                      className={
                        site.is_shared === 'YES' || site.is_shared === true
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {site.is_shared === 'YES' || site.is_shared === true ? 'YES' : 'NO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={site.has_appointment === 'YES' || site.has_appointment === true ? 'default' : 'secondary'}
                      className={
                        site.has_appointment === 'YES' || site.has_appointment === true
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {site.has_appointment === 'YES' || site.has_appointment === true ? 'YES' : 'NO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(site.email_open_count ?? 0) > 0 ? 'default' : 'secondary'}
                      className={
                        (site.email_open_count ?? 0) > 0
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {(site.email_open_count ?? 0) > 0 ? 'YES' : 'NO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{(site.email_open_count ?? 0) > 0 ? site.email_open_count : '—'}</TableCell>
                </TableRow>
              ))}
              {filteredSites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No sites found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default WebLeadsPage;
