import { Card } from '@/components/ui/card';
import { SiteData } from '@/services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

interface KeyMetricsProps {
  sites: SiteData[];
}

interface AgentMetrics {
  agentName: string;
  sitesAdded: number;
  sitesShared: number;
  appointmentsBooked: number;
  sharedPercentage: number;
  appointmentPercentage: number;
}

const filterSitesByDateRange = (sites: SiteData[], startDate: Date, endDate: Date): SiteData[] => {
  return sites.filter(site => {
    const siteDate = new Date(site.onboard_date);
    return siteDate >= startDate && siteDate <= endDate;
  });
};

const calculateAgentMetrics = (sites: SiteData[]): AgentMetrics[] => {
  const agentMap = new Map<string, AgentMetrics>();

  sites.forEach(site => {
    const agentName = site.agent_name || 'Unknown';
    
    if (!agentMap.has(agentName)) {
      agentMap.set(agentName, {
        agentName,
        sitesAdded: 0,
        sitesShared: 0,
        appointmentsBooked: 0,
        sharedPercentage: 0,
        appointmentPercentage: 0,
      });
    }

    const metrics = agentMap.get(agentName)!;
    metrics.sitesAdded++;

    if (site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1) {
      metrics.sitesShared++;
    }

    if (site.appointment_time_from !== null && site.appointment_time_from !== '') {
      metrics.appointmentsBooked++;
    }
  });

  // Calculate percentages
  agentMap.forEach(metrics => {
    metrics.sharedPercentage = metrics.sitesAdded > 0 ? (metrics.sitesShared / metrics.sitesAdded) * 100 : 0;
    metrics.appointmentPercentage = metrics.sitesAdded > 0 ? (metrics.appointmentsBooked / metrics.sitesAdded) * 100 : 0;
  });

  return Array.from(agentMap.values()).sort((a, b) => b.sitesAdded - a.sitesAdded);
};

interface TimePeriodMetricsProps {
  title: string;
  sites: SiteData[];
}

const TimePeriodMetrics = ({ title, sites }: TimePeriodMetricsProps) => {
  const metrics = calculateAgentMetrics(sites);

  if (metrics.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <Card className="p-6">
          <p className="text-muted-foreground text-center">No data available for this period</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sites Added Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Sites Added by Agent</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="agentName" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sitesAdded" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sites Shared Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Sites Shared by Agent</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="agentName" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sitesShared" fill="hsl(220, 100%, 45%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Appointments Booked Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Appointments Booked by Agent</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="agentName" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointmentsBooked" fill="hsl(142, 76%, 36%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Agent Performance Summary</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead className="text-right">Sites Added</TableHead>
                <TableHead className="text-right">Sites Shared</TableHead>
                <TableHead className="text-right">Appointments Booked</TableHead>
                <TableHead className="text-right">Shared %</TableHead>
                <TableHead className="text-right">Appointment %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((agent) => (
                <TableRow key={agent.agentName}>
                  <TableCell className="font-medium">{agent.agentName}</TableCell>
                  <TableCell className="text-right">{agent.sitesAdded}</TableCell>
                  <TableCell className="text-right">{agent.sitesShared}</TableCell>
                  <TableCell className="text-right">{agent.appointmentsBooked}</TableCell>
                  <TableCell className="text-right">{agent.sharedPercentage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{agent.appointmentPercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

const KeyMetrics = ({ sites }: KeyMetricsProps) => {
  const now = new Date();
  
  // Calculate date ranges
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  
  const last6MonthsStart = startOfMonth(subMonths(now, 6));
  const last6MonthsEnd = endOfMonth(now);

  // Filter sites by date ranges
  const todaySites = filterSitesByDateRange(sites, todayStart, todayEnd);
  const yesterdaySites = filterSitesByDateRange(sites, yesterdayStart, yesterdayEnd);
  const weekSites = filterSitesByDateRange(sites, weekStart, weekEnd);
  const monthSites = filterSitesByDateRange(sites, monthStart, monthEnd);
  const lastMonthSites = filterSitesByDateRange(sites, lastMonthStart, lastMonthEnd);
  const last6MonthsSites = filterSitesByDateRange(sites, last6MonthsStart, last6MonthsEnd);

  return (
    <div className="space-y-8">
      <TimePeriodMetrics title="Today's Statistics" sites={todaySites} />
      <TimePeriodMetrics title="Yesterday's Statistics" sites={yesterdaySites} />
      <TimePeriodMetrics title="Current Week" sites={weekSites} />
      <TimePeriodMetrics title="Current Month" sites={monthSites} />
      <TimePeriodMetrics title="Last Month" sites={lastMonthSites} />
      <TimePeriodMetrics title="Last 6 Months" sites={last6MonthsSites} />
    </div>
  );
};

export default KeyMetrics;
