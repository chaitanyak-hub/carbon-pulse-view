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
  // Helper function to generate daily sites added for last 30 days
  const generateDailySitesAdded = () => {
    const days = [];
    const now = new Date();
    const agents = ["Chaitanya K", "Sarah Johnson", "Mike Chen", "Emma Watson", "David Rodriguez", "Lisa Park", "Alex Thompson"];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Generate realistic daily site additions (0-15 per day)
      const totalSitesAdded = Math.floor(Math.random() * 16); // 0-15 sites per day
      
      // Distribute among agents
      const agentData: any = {
        date: dayLabel,
        fullDate: date.toISOString().split('T')[0],
        totalSitesAdded
      };
      
      // Add individual agent data
      agents.forEach(agent => {
        const agentSites = totalSitesAdded > 0 ? Math.floor(Math.random() * (totalSitesAdded / agents.length + 3)) : 0;
        agentData[agent.replace(' ', '_')] = agentSites;
      });
      
      days.push(agentData);
    }
    
    return days;
  };

  // Helper function to generate weekly trends for last 12 weeks
  const generateWeeklyTrends = () => {
    const weeks = [];
    const now = new Date();
    
    // Base values for realistic data generation
    const baseTotal = 450;
    const growthTrend = 1.02; // 2% weekly growth
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekLabel = `W${12 - i}`;
      
      // Generate realistic trending data with some variability
      const weekMultiplier = Math.pow(growthTrend, 11 - i);
      const variance = 0.85 + Math.random() * 0.3; // ±15% variance
      
      const totalSites = Math.floor(baseTotal * weekMultiplier * variance);
      const activeSites = Math.floor(totalSites * (0.72 + Math.random() * 0.16)); // 72-88% active
      const consentGranted = Math.floor(totalSites * (0.58 + Math.random() * 0.25)); // 58-83% consent
      const withAppointments = Math.floor(totalSites * (0.35 + Math.random() * 0.30)); // 35-65% appointments
      const sharedSites = Math.floor(totalSites * (0.42 + Math.random() * 0.28)); // 42-70% shared
      
      weeks.push({
        period: weekLabel,
        totalSites,
        activeSites,
        inactiveSites: totalSites - activeSites,
        consentGranted,
        consentPending: totalSites - consentGranted,
        withAppointments,
        withoutAppointments: totalSites - withAppointments,
        sharedSites,
        unsharedSites: totalSites - sharedSites,
        consentRate: totalSites > 0 ? Math.round((consentGranted / totalSites) * 100) : 0,
        appointmentRate: totalSites > 0 ? Math.round((withAppointments / totalSites) * 100) : 0,
        shareRate: totalSites > 0 ? Math.round((sharedSites / totalSites) * 100) : 0,
        activeRate: totalSites > 0 ? Math.round((activeSites / totalSites) * 100) : 0
      });
    }
    
    return weeks;
  };

  // Helper function to generate monthly trends for last 12 months
  const generateMonthlyTrends = () => {
    const months = [];
    const now = new Date();
    
    // Base values for realistic monthly data
    const baseTotal = 1200;
    const growthTrend = 1.08; // 8% monthly growth
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Generate realistic trending data with seasonal variations
      const monthMultiplier = Math.pow(growthTrend, 11 - i);
      const seasonalBoost = Math.sin(((11 - i) / 12) * 2 * Math.PI) * 0.1 + 1; // Seasonal variation
      const variance = 0.9 + Math.random() * 0.2; // ±10% variance
      
      const totalSites = Math.floor(baseTotal * monthMultiplier * seasonalBoost * variance);
      const activeSites = Math.floor(totalSites * (0.75 + Math.random() * 0.15)); // 75-90% active
      const consentGranted = Math.floor(totalSites * (0.62 + Math.random() * 0.25)); // 62-87% consent
      const withAppointments = Math.floor(totalSites * (0.40 + Math.random() * 0.35)); // 40-75% appointments
      const sharedSites = Math.floor(totalSites * (0.48 + Math.random() * 0.30)); // 48-78% shared
      
      months.push({
        period: monthLabel,
        totalSites,
        activeSites,
        inactiveSites: totalSites - activeSites,
        consentGranted,
        consentPending: totalSites - consentGranted,
        withAppointments,
        withoutAppointments: totalSites - withAppointments,
        sharedSites,
        unsharedSites: totalSites - sharedSites,
        consentRate: totalSites > 0 ? Math.round((consentGranted / totalSites) * 100) : 0,
        appointmentRate: totalSites > 0 ? Math.round((withAppointments / totalSites) * 100) : 0,
        shareRate: totalSites > 0 ? Math.round((sharedSites / totalSites) * 100) : 0,
        activeRate: totalSites > 0 ? Math.round((activeSites / totalSites) * 100) : 0
      });
    }
    
    return months;
  };

  const dailySitesData = generateDailySitesAdded();
  const weeklyData = generateWeeklyTrends();
  const monthlyData = generateMonthlyTrends();
  
  // Agent totals for the period
  const agentTotals = dailySitesData.reduce((acc, day) => {
    ["Chaitanya K", "Sarah Johnson", "Mike Chen", "Emma Watson", "David Rodriguez", "Lisa Park", "Alex Thompson"].forEach(agent => {
      const key = agent.replace(' ', '_');
      acc[agent] = (acc[agent] || 0) + (day[key] || 0);
    });
    return acc;
  }, {} as Record<string, number>);
  
  const agentData = Object.entries(agentTotals).map(([name, total]) => ({
    name,
    total,
    color: `hsl(var(--chart-${(Object.keys(agentTotals).indexOf(name) % 6) + 1}))`
  }));

  // Process data for charts
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

  // Appointment data
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
        {/* Loading state for new charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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
      {/* Daily Site Additions - Last 30 Days */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Daily Site Additions (Last 30 Days)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Total Sites Added */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Total Sites Added Per Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySitesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="totalSitesAdded" 
                  fill="hsl(var(--chart-1))" 
                  name="Sites Added"
                >
                  <LabelList dataKey="totalSitesAdded" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Sites Added by Agent (30-day totals) */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Sites Added by Agent (30-day Total)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total Sites Added">
                  {agentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="total" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Daily Sites by Top 4 Agents */}
          <Card className="chart-container lg:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Daily Sites Added by Top Agents</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySitesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Chaitanya_K" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  name="Chaitanya K"
                  dot={{ r: 4 }}
                >
                  <LabelList dataKey="Chaitanya_K" position="top" />
                </Line>
                <Line 
                  type="monotone" 
                  dataKey="Sarah_Johnson" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  name="Sarah Johnson"
                  dot={{ r: 4 }}
                >
                  <LabelList dataKey="Sarah_Johnson" position="top" />
                </Line>
                <Line 
                  type="monotone" 
                  dataKey="Mike_Chen" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={3}
                  name="Mike Chen"
                  dot={{ r: 4 }}
                >
                  <LabelList dataKey="Mike_Chen" position="top" />
                </Line>
                <Line 
                  type="monotone" 
                  dataKey="Emma_Watson" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={3}
                  name="Emma Watson"
                  dot={{ r: 4 }}
                >
                  <LabelList dataKey="Emma_Watson" position="top" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Weekly Trends - Last 12 Weeks */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Weekly Trends (Last 12 Weeks)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Sites Week on Week */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Total Sites - Weekly</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.5}
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Active Sites Weekly */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Active vs Inactive Sites - Weekly</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="activeSites" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={4}
                  name="Active Sites"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Total Sites"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Consent Rate Weekly */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Consent Rate - Weekly (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="consentRate" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.5}
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Appointment Rate Weekly */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Appointment Rate - Weekly (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="appointmentRate" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.5}
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Monthly Trends - Last 12 Months */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Monthly Trends (Last 12 Months)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Sites Month on Month */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Total Sites - Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                  strokeWidth={5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* KPI Trends Monthly */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">All KPI Rates - Monthly (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="consentRate" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={4}
                  name="Consent Rate %"
                />
                <Line 
                  type="monotone" 
                  dataKey="appointmentRate" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={4}
                  name="Appointment Rate %"
                />
                <Line 
                  type="monotone" 
                  dataKey="shareRate" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={4}
                  name="Share Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Volume Comparison */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Monthly Volume Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="activeSites" fill="hsl(var(--chart-1))" name="Active Sites" />
                <Bar dataKey="consentGranted" fill="hsl(var(--chart-2))" name="Consent Granted" />
                <Bar dataKey="withAppointments" fill="hsl(var(--chart-3))" name="With Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Current Status Distribution */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Status Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={siteStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {siteStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;