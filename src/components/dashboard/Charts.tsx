import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { SiteData } from '@/services/api';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
  // Calculate Core KPIs from real data
  const calculateBusinessKPIs = () => {
    const totalSites = sites.length;
    const consentsObtained = sites.filter(site => site.consent === 'YES').length;
    const sitesShared = sites.filter(site => site.is_shared).length;
    const appointmentsBooked = sites.filter(site => site.has_appointment).length;
    
    // Customer Journey Funnel (assuming total sites represent initial contacts)
    const consentRate = totalSites > 0 ? (consentsObtained / totalSites) * 100 : 0;
    const shareRate = consentsObtained > 0 ? (sitesShared / consentsObtained) * 100 : 0;
    const appointmentRate = sitesShared > 0 ? (appointmentsBooked / sitesShared) * 100 : 0;
    
    return {
      totalSites,
      consentsObtained,
      sitesShared,
      appointmentsBooked,
      consentRate,
      shareRate,
      appointmentRate,
      consentDeclineRate: 100 - consentRate
    };
  };

  // Generate funnel data for visualization
  const generateFunnelData = () => {
    const kpis = calculateBusinessKPIs();
    return [
      { stage: 'Initial Contact', count: kpis.totalSites, percentage: 100, color: 'hsl(var(--chart-1))' },
      { stage: 'Consent Obtained', count: kpis.consentsObtained, percentage: kpis.consentRate, color: 'hsl(var(--chart-2))' },
      { stage: 'Sites Shared', count: kpis.sitesShared, percentage: kpis.shareRate, color: 'hsl(var(--chart-3))' },
      { stage: 'Appointments Booked', count: kpis.appointmentsBooked, percentage: kpis.appointmentRate, color: 'hsl(var(--chart-4))' }
    ];
  };

  // Generate agent performance data
  const generateAgentPerformance = () => {
    const agentStats = sites.reduce((acc, site) => {
      const agent = site.agent_name;
      if (!acc[agent]) {
        acc[agent] = {
          name: agent,
          totalSites: 0,
          consents: 0,
          sitesShared: 0,
          appointments: 0
        };
      }
      
      acc[agent].totalSites++;
      if (site.consent === 'YES') acc[agent].consents++;
      if (site.is_shared) acc[agent].sitesShared++;
      if (site.has_appointment) acc[agent].appointments++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(agentStats).map((agent: any) => ({
      ...agent,
      consentRate: agent.totalSites > 0 ? Math.round((agent.consents / agent.totalSites) * 100) : 0,
      appointmentRate: agent.sitesShared > 0 ? Math.round((agent.appointments / agent.sitesShared) * 100) : 0
    }));
  };

  // Generate daily activity trends
  const generateDailyTrends = () => {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const daySites = sites.filter(site => site.onboard_date === dateStr);
      const dayConsents = daySites.filter(site => site.consent === 'YES');
      const dayShared = daySites.filter(site => site.is_shared);
      const dayAppointments = daySites.filter(site => site.has_appointment);
      
      last30Days.push({
        date: dayLabel,
        sitesAdded: daySites.length,
        consentsObtained: dayConsents.length,
        sitesShared: dayShared.length,
        appointmentsBooked: dayAppointments.length
      });
    }
    
    return last30Days;
  };

  // Generate conversion metrics
  const generateConversionMetrics = () => {
    const kpis = calculateBusinessKPIs();
    return [
      { metric: 'Consent Rate', value: kpis.consentRate, target: 75, color: 'hsl(var(--chart-1))' },
      { metric: 'Share Rate', value: kpis.shareRate, target: 80, color: 'hsl(var(--chart-2))' },
      { metric: 'Appointment Rate', value: kpis.appointmentRate, target: 60, color: 'hsl(var(--chart-3))' },
      { metric: 'End-to-End Rate', value: (kpis.appointmentsBooked / kpis.totalSites) * 100, target: 35, color: 'hsl(var(--chart-4))' }
    ];
  };

  const funnelData = generateFunnelData();
  const agentPerformance = generateAgentPerformance();
  const dailyTrends = generateDailyTrends();
  const conversionMetrics = generateConversionMetrics();

  // Process data for charts from real API data
  const siteStatusData = [
    {
      name: 'Active',
      value: sites.filter(site => site.site_status === 'active').length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Inactive',
      value: sites.filter(site => site.site_status === 'inactive').length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const consentData = [
    {
      name: 'Granted',
      value: sites.filter(site => site.consent === 'YES').length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Pending/Denied',
      value: sites.filter(site => site.consent === 'NO').length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const appointmentData = [
    {
      name: 'With Appointments',
      value: sites.filter(site => site.has_appointment).length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Without Appointments',
      value: sites.filter(site => !site.has_appointment).length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-blue-100 border border-blue-200 p-6 rounded-lg animate-pulse">
              <div className="h-64 bg-blue-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Customer Journey Funnel */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Customer Journey Funnel</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Visualization */}
          <Card className="chart-container lg:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count">
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="count" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Conversion Rates */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Conversion Rates vs Targets</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" name="Actual %">
                  <LabelList dataKey="value" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} />
                </Bar>
                <Bar dataKey="target" fill="hsl(var(--chart-2))" opacity={0.3} name="Target %">
                  <LabelList dataKey="target" position="top" formatter={(value: number) => `${value}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity Status Distribution */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Pipeline Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ stage, count, percentage }) => `${stage}: ${count} (${percentage.toFixed(1)}%)`}
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Agent Performance Dashboard */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Agent Performance Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Leaderboard - Total Sites */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Sites Added by Agent</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agentPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalSites" fill="hsl(var(--chart-1))" name="Total Sites">
                  <LabelList dataKey="totalSites" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Agent Conversion Rates */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Agent Conversion Rates</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="consentRate" fill="hsl(var(--chart-1))" name="Consent Rate %">
                  <LabelList dataKey="consentRate" position="top" formatter={(value: number) => `${value}%`} />
                </Bar>
                <Bar dataKey="appointmentRate" fill="hsl(var(--chart-2))" name="Appointment Rate %">
                  <LabelList dataKey="appointmentRate" position="top" formatter={(value: number) => `${value}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Agent Activity Breakdown */}
          <Card className="chart-container lg:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Agent Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="consents" fill="hsl(var(--chart-1))" name="Consents Obtained" />
                <Bar dataKey="sitesShared" fill="hsl(var(--chart-2))" name="Sites Shared" />
                <Bar dataKey="appointments" fill="hsl(var(--chart-3))" name="Appointments Booked" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Daily Activity Trends */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Daily Activity Trends (Last 30 Days)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Pipeline Activities */}
          <Card className="chart-container lg:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Daily Pipeline Activities</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sitesAdded" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  name="Sites Added"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consentsObtained" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  name="Consents Obtained"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sitesShared" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={3}
                  name="Sites Shared"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="appointmentsBooked" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={3}
                  name="Appointments Booked"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Daily Sites Added */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Daily Sites Added</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sitesAdded" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.5}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Daily Appointments */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Daily Appointments Booked</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="appointmentsBooked" 
                  stroke="hsl(var(--chart-4))" 
                  fill="hsl(var(--chart-4))"
                  fillOpacity={0.5}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;