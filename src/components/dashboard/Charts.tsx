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
  Area
} from 'recharts';
import { SiteData } from '@/services/api';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
  // Helper function to generate weekly trends for last 12 weeks
  const generateWeeklyTrends = () => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekLabel = `Week ${12 - i}`;
      
      // Generate simulated data based on current site distribution
      const totalSites = Math.floor(sites.length * (0.3 + Math.random() * 0.4));
      const activeSites = Math.floor(totalSites * 0.7 + Math.random() * totalSites * 0.2);
      const consentGranted = Math.floor(totalSites * 0.6 + Math.random() * totalSites * 0.3);
      const withAppointments = Math.floor(totalSites * 0.4 + Math.random() * totalSites * 0.4);
      const sharedSites = Math.floor(totalSites * 0.5 + Math.random() * totalSites * 0.3);
      
      weeks.push({
        period: weekLabel,
        totalSites,
        activeSites,
        consentGranted,
        withAppointments,
        sharedSites,
        consentRate: totalSites > 0 ? (consentGranted / totalSites) * 100 : 0,
        appointmentRate: totalSites > 0 ? (withAppointments / totalSites) * 100 : 0,
        shareRate: totalSites > 0 ? (sharedSites / totalSites) * 100 : 0
      });
    }
    
    return weeks;
  };

  // Helper function to generate monthly trends for last 12 months
  const generateMonthlyTrends = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Generate simulated data based on current site distribution with growth trend
      const growthMultiplier = 0.6 + (11 - i) * 0.04; // Growth over time
      const totalSites = Math.floor(sites.length * growthMultiplier * (0.8 + Math.random() * 0.4));
      const activeSites = Math.floor(totalSites * 0.75 + Math.random() * totalSites * 0.15);
      const consentGranted = Math.floor(totalSites * 0.65 + Math.random() * totalSites * 0.25);
      const withAppointments = Math.floor(totalSites * 0.45 + Math.random() * totalSites * 0.35);
      const sharedSites = Math.floor(totalSites * 0.55 + Math.random() * totalSites * 0.25);
      
      months.push({
        period: monthLabel,
        totalSites,
        activeSites,
        consentGranted,
        withAppointments,
        sharedSites,
        consentRate: totalSites > 0 ? (consentGranted / totalSites) * 100 : 0,
        appointmentRate: totalSites > 0 ? (withAppointments / totalSites) * 100 : 0,
        shareRate: totalSites > 0 ? (sharedSites / totalSites) * 100 : 0
      });
    }
    
    return months;
  };

  const weeklyData = generateWeeklyTrends();
  const monthlyData = generateMonthlyTrends();

  // Process data for charts
  const siteStatusData = [
    {
      name: 'Active',
      value: sites.filter(site => site.site_status === 'active').length,
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Inactive',
      value: sites.filter(site => site.site_status === 'inactive').length,
      color: 'hsl(var(--muted))'
    }
  ];

  const consentData = [
    {
      name: 'Granted',
      value: sites.filter(site => site.consent === 'YES').length,
      color: 'hsl(142 76 36)'
    },
    {
      name: 'Pending/Denied',
      value: sites.filter(site => site.consent === 'NO').length,
      color: 'hsl(0 84 60)'
    }
  ];

  // Appointment data
  const appointmentData = [
    {
      name: 'With Appointments',
      value: sites.filter(site => site.has_appointment).length,
      color: 'hsl(221 83 53)'
    },
    {
      name: 'Without Appointments',
      value: sites.filter(site => !site.has_appointment).length,
      color: 'hsl(215 20 65)'
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
            <Card key={index} className="dashboard-card animate-pulse">
              <div className="h-64 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Weekly Trends - Last 12 Weeks */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-card-foreground">Weekly Trends (Last 12 Weeks)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Sites Week on Week */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Total Sites - Weekly</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Active Sites Weekly */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Active vs Inactive Sites - Weekly</h3>
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
                  stroke="hsl(142 76 36)" 
                  strokeWidth={2}
                  name="Active Sites"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total Sites"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Consent Rate Weekly */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Consent Rate - Weekly (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="consentRate" 
                  stroke="hsl(142 76 36)" 
                  fill="hsl(142 76 36)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Appointment Rate Weekly */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Appointment Rate - Weekly (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="appointmentRate" 
                  stroke="hsl(221 83 53)" 
                  fill="hsl(221 83 53)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Monthly Trends - Last 12 Months */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-card-foreground">Monthly Trends (Last 12 Months)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Sites Month on Month */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Total Sites - Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalSites" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* KPI Trends Monthly */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">All KPI Rates - Monthly (%)</h3>
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
                  stroke="hsl(142 76 36)" 
                  strokeWidth={2}
                  name="Consent Rate %"
                />
                <Line 
                  type="monotone" 
                  dataKey="appointmentRate" 
                  stroke="hsl(221 83 53)" 
                  strokeWidth={2}
                  name="Appointment Rate %"
                />
                <Line 
                  type="monotone" 
                  dataKey="shareRate" 
                  stroke="hsl(168 76 42)" 
                  strokeWidth={2}
                  name="Share Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Volume Comparison */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Monthly Volume Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="activeSites" fill="hsl(142 76 36)" name="Active Sites" />
                <Bar dataKey="consentGranted" fill="hsl(221 83 53)" name="Consent Granted" />
                <Bar dataKey="withAppointments" fill="hsl(168 76 42)" name="With Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Current Status Distribution */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Current Status Overview</h3>
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